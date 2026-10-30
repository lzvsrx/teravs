import { createApp } from './app.mjs';
const app = await createApp();
app.server.listen(Number(process.env.PORT || 4318), process.env.HOST || '127.0.0.1', () => console.log('Serviço Teravs iniciado.'));
app.server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Já existe um serviço nesta porta.' : 'Falha ao iniciar o serviço Teravs.'); process.exit(1); });
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, async () => { await app.close(); process.exit(0); });
