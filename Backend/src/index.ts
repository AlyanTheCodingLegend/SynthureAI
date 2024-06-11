import { WebSocket } from 'ws';
import http from 'http';
import { SessionManager } from './SessionManager';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server\n');
})

const wss = new WebSocket.Server({ server: server});

const sessionManager = new SessionManager();

wss.on('connection', function connection(ws) {
  sessionManager.addHandler(ws);
});

server.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});