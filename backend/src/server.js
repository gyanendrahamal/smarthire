import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { initSocketIO } from './sockets/socketHandler.js';

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 SmartHire Server running on port ${PORT}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend Origin: ${config.frontendUrl}`);
  console.log(`===============================================`);
});

export default server;
