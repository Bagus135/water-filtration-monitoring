import { WebSocket as WSClient } from "ws";

interface ExtendedWebSocket extends WSClient {
  isAlive?: boolean;
  isEsp32?: boolean;
  deviceId?: string;
}
