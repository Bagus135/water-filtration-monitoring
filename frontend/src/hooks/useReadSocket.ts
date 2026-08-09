"use client";

import { useEffect, useRef, useState } from "react";
import {
  UseWaterQualitySocketResult,
  WaterQualityClientsReading,
} from "../types/types";

export function useWaterQualitySocket(): UseWaterQualitySocketResult {
  const [reading, setReading] = useState<WaterQualityClientsReading | null>(
    null,
  );
  const [isESP32Connected, setESP32IsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket terhubung");
      if (wsRef.current !== ws) return;
    };

    ws.onmessage = (e) => {
      if (wsRef.current !== ws) return;

      const msg = JSON.parse(e.data);

      if (msg.type == "reading") {
        setReading(msg.data as WaterQualityClientsReading);
      } else if (msg.type === "status") {
        setESP32IsConnected(Boolean(msg.espcount));
      }
    };

    ws.onclose = () => {
      console.log("WebSocket terputus");
      setESP32IsConnected(false);
    };

    return () => ws.close();
  }, []);

  return { reading, isESP32Connected };
}
