import { WebSocket } from 'ws';
import http from 'http';
import { SessionManager } from './SessionManager';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server\n');
})

const wss = new WebSocket.Server({ server: server});

const sessionManager = new SessionManager();

wss.on('connection', function connection(ws) {
  sessionManager.addHandler(ws);
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});