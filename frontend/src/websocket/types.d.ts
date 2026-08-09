import { WebSocket as WSClient } from "ws";

interface ExtendedWebSocket extends WSClient {
  lastSeen?: number;
  isEsp32?: boolean;
  deviceId?: string;
}
