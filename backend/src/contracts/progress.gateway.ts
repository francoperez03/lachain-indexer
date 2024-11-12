import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class ProgressGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: WebSocket) {
    console.log('Client connected');
    client.on('close', () => console.log('Client disconnected'));
  }

  sendProgressUpdate(percentage: number) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ event: 'progressUpdate', data: { percentage } }),
        );
      }
    });
  }

  sendChunkStatusUpdate(chunkData: {
    fromBlock: number;
    toBlock: number;
    status: string;
  }) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ event: 'chunkStatusUpdate', data: chunkData }),
        );
      }
    });
  }
}
