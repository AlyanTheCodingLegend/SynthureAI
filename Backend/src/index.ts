import { WebSocketServer } from 'ws';
import { SessionManager } from './SessionManager';

const wss = new WebSocketServer({ port: 8080 });

const sessionManager = new SessionManager();

wss.on('connection', function connection(ws) {
  sessionManager.addUser(ws, 100);

  ws.on('disconnect', () => {
    sessionManager.removeUser(ws, 100);
  });
});