$ErrorActionPreference = 'Stop'
$teravsRoot = $PSScriptRoot
$ollamaExe = Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'
$env:CUDA_VISIBLE_DEVICES = '-1'
$env:GGML_VK_VISIBLE_DEVICES = '-1'
if (Test-Path -LiteralPath $ollamaExe) {
    try { $null = Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 3 }
    catch { Start-Process -FilePath $ollamaExe -ArgumentList 'serve' -WindowStyle Hidden }
}
$teravsExe = Join-Path $teravsRoot 'release\Teravs 0.2.0.exe'
if (Test-Path -LiteralPath $teravsExe) {
    Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
    Start-Process -FilePath $teravsExe
} else {
    Set-Location -LiteralPath $teravsRoot
    npm.cmd start
}
