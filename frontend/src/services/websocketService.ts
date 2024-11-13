
export interface websocketMessage { 
  event: string;
  data:{
    percentage: number;
  }
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private pingInterval: number | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (data: websocketMessage) => void) {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.startPinging();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.reconnect(onMessage);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopPinging();
      this.reconnect(onMessage);
    };
  }

  private startPinging() {
    this.pingInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPinging() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private reconnect(onMessage: (data: websocketMessage) => void) {
    setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect(onMessage);
    }, 3000);
  }

  sendMessage(message: websocketMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.stopPinging();
    }
  }
}

export default new WebSocketService('ws://localhost:3000');
