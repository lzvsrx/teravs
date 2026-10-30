[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[^@\s]+@(gmail|googlemail)\.com$')]
    [string]$SenderEmail,
    [switch]$Preview
)
$ErrorActionPreference = 'Stop'
$projectRef = 'pzrzemrnmexgncmciofy'
$taskRoot = Join-Path ([IO.Path]::GetTempPath()) ('teravs-smtp-' + [guid]::NewGuid().ToString('N'))
$configDirectory = Join-Path $taskRoot 'supabase'
$configFile = Join-Path $configDirectory 'config.toml'
$previousPassword = [Environment]::GetEnvironmentVariable('TERAVS_SMTP_PASSWORD', 'Process')
$smtpClient = $null
$mail = $null
$appPassword = $null
$stateDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'data'
function Write-SetupState([string]$State) {
    if ($Preview) { return }
    New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
    $json = @{ status = $State; updatedAt = [DateTime]::UtcNow.ToString('o'); project = $projectRef } | ConvertTo-Json -Compress
    [IO.File]::WriteAllText((Join-Path $stateDirectory 'smtp-setup-status.json'), $json)
}
try {
    New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null
    $quotedSender = ConvertTo-Json -InputObject $SenderEmail -Compress
    $configuration = @"
project_id = "teravs-smtp"
[auth.email]
enable_confirmations = true
[auth.email.smtp]
enabled = true
host = "smtp.gmail.com"
port = 587
user = $quotedSender
pass = "env(TERAVS_SMTP_PASSWORD)"
admin_email = $quotedSender
sender_name = "Teravs"
[auth.rate_limit]
email_sent = 10
"@
    [IO.File]::WriteAllText($configFile, $configuration, [Text.UTF8Encoding]::new($false))
    if ($Preview) {
        Write-Output $configuration
        Write-Output 'PREVIEW: no email sent and no online configuration changed.'
        return
    }
    Get-Command npx.cmd -ErrorAction Stop | Out-Null
    Write-SetupState 'awaiting-app-password'
    Write-Host 'Configurar envio de verificacao do Teravs pelo Gmail.'
    Write-Host 'Use uma senha de app do Google; nunca use a senha normal da conta.'
    Write-Host 'A senha nao sera gravada no projeto nem mostrada no terminal.'
    Write-Host "Sera enviado um email de teste somente para $SenderEmail antes de ativar o SMTP."
    Write-Host 'Crie a senha em https://myaccount.google.com/apppasswords (exige verificacao em duas etapas).'
    $appPassword = Read-Host 'Cole aqui a senha de app de 16 caracteres' -AsSecureString
    $credential = [Net.NetworkCredential]::new($SenderEmail, $appPassword)
    $env:TERAVS_SMTP_PASSWORD = $credential.Password.Replace(' ', '')
    if ($env:TERAVS_SMTP_PASSWORD -notmatch '^[a-zA-Z0-9]{16}$') { throw 'Formato de senha de app invalido. Nada foi alterado no Supabase.' }

    $smtpClient = [Net.Mail.SmtpClient]::new('smtp.gmail.com', 587)
    $smtpClient.EnableSsl = $true
    $smtpClient.UseDefaultCredentials = $false
    $smtpClient.Credentials = [Net.NetworkCredential]::new($SenderEmail, $env:TERAVS_SMTP_PASSWORD)
    $smtpClient.Timeout = 15000
    $mail = [Net.Mail.MailMessage]::new($SenderEmail, $SenderEmail)
    $mail.Subject = 'Teravs - teste de envio SMTP'
    $mail.Body = 'Teste solicitado na configuracao do Teravs. Este email verifica o envio pelo Gmail; ele nao confirma nem altera sua conta Teravs. A confirmacao do cadastro continua sendo enviada pelo Supabase.'
    try { $smtpClient.Send($mail) } catch { throw 'O Gmail nao aceitou o teste SMTP. Confira a senha de app, a verificacao em duas etapas e as regras da conta. O Supabase nao foi alterado.' }
    Write-SetupState 'smtp-test-accepted'
    Write-Host 'Gmail aceitou o email de teste. Aplicando SMTP ao projeto Supabase...'

    # Capture all CLI output: never print raw errors or a diff containing secrets.
    $savedErrorPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $cliOutput = & npx.cmd --yes supabase config push --project-ref $projectRef --workdir $taskRoot --yes --output-format json 2>&1 | Out-String
        $pushExit = $LASTEXITCODE
    } finally { $ErrorActionPreference = $savedErrorPreference }
    if ($pushExit -ne 0) { throw 'Nao foi possivel aplicar a configuracao. Verifique o login administrativo do Supabase. Nenhuma credencial sera exibida.' }
    Write-SetupState 'configured'
    Write-Host 'SMTP configurado. Confirmacao obrigatoria preservada; limite inicial de 10 emails por hora.' -ForegroundColor Green
    Write-Host 'Confira o recebimento do teste e teste um cadastro novo. Conta ja confirmada deve entrar com senha.'
    Write-Host 'A entrega na caixa de entrada e os limites do Google ainda dependem da conta e do destinatario.'
} catch {
    Write-SetupState 'failed'
    throw
} finally {
    [Environment]::SetEnvironmentVariable('TERAVS_SMTP_PASSWORD', $previousPassword, 'Process')
    if ($smtpClient) { $smtpClient.Dispose() }
    if ($mail) { $mail.Dispose() }
    if ($appPassword) { $appPassword.Dispose() }
    $credential = $null
    $cliOutput = $null
    # Only remove the specific temporary files and empty folders created above.
    if (Test-Path -LiteralPath $configFile) { Remove-Item -LiteralPath $configFile -Force }
    if ((Test-Path -LiteralPath $configDirectory) -and @(Get-ChildItem -LiteralPath $configDirectory -Force).Count -eq 0) { Remove-Item -LiteralPath $configDirectory }
    if ((Test-Path -LiteralPath $taskRoot) -and @(Get-ChildItem -LiteralPath $taskRoot -Force).Count -eq 0) { Remove-Item -LiteralPath $taskRoot }
}
