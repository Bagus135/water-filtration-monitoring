import { IncomingMessage, Server } from "http";
import { NextServer } from "next/dist/server/next";
import { parse } from "url";
import { WebSocketServer, WebSocket as WSClient } from "ws";
import { WaterQualityClientsReading, WaterQualityESP32Reading } from "../types/types";
import { ExtendedWebSocket } from "./types";

export const clients = new Set<ExtendedWebSocket>()

let lastReading : WaterQualityClientsReading; 
let esp32ConnectedCount : number = 0

function broadcastStatus(){
    const payload = JSON.stringify({
        type : "status", 
        espcount :  esp32ConnectedCount
    })
    for(const client of clients){
        if(client.readyState == WSClient.OPEN){
            client.send(payload);
        }
    }
}

export function createWSServer(server: Server, app : NextServer){
    const wss = new WebSocketServer({
        noServer: true
    });

    server.on("upgrade" , (req, socket, head) =>{
        const {pathname} = parse(req.url || "", true); 
        if (pathname === "/ws") { 
            wss.handleUpgrade(req, socket, head , (ws)=> {
                wss.emit("connection", ws, req);
            })
        } else {
            app.getUpgradeHandler()(req,socket,head);
        }
    })
    
    wss.on("connection", (wsRaw : WSClient, req : IncomingMessage) =>{
        const ws = wsRaw as ExtendedWebSocket
        const {query} = parse(req.url || "", true);
        const isESP32 = query.role === "esp32";
        const device_id  = query.device_id as string;
        const token = query.token as string; 
        
        ws.isEsp32 = isESP32;
        ws.isAlive = true;
        ws.deviceId = device_id ;
        
        if( isESP32 && token !== process.env.TOKEN){
            console.log("The device does not have a valid token.")
            ws.close(4001,"Token is invalid");
            return;
        }
        ws.on("pong", function(this : ExtendedWebSocket){
            this.isAlive = true;
        });

        console.log( isESP32 ? `ESP32 connected ${device_id}` : "Other device");
        clients.add(ws);

        if (isESP32){
            esp32ConnectedCount ++; 
            broadcastStatus();
        }

        ws.send(JSON.stringify({type : "status", espcount :  esp32ConnectedCount}))
        if (lastReading){
            ws.send(JSON.stringify({
                type : "reading", 
                data : lastReading,
            }))
        }

        ws.on("message", (raw : Buffer)=> {
        let msg : Partial<WaterQualityESP32Reading>; 
        try {
            msg = JSON.parse(raw.toString())
        } catch {
            console.error("Data bukan JSON valid :")
            return;
        }

        if(!msg.before || !msg.after){
            console.warn("Format data is incorrect", msg)
            return;
        }

        lastReading = {
            before : msg.before,
            after : msg.after,
            timestamp : new Date().toLocaleTimeString()
        };

        const payload = JSON.stringify({type : "reading", data : lastReading})
        for (const client of clients) {
            if(client.readyState === WebSocket.OPEN){
                client.send(payload);
            }
        }
        })

        ws.on("close", ()=>{
            clients.delete(ws);
            if(isESP32){
                esp32ConnectedCount = Math.max(0, esp32ConnectedCount -1);
                broadcastStatus();
            }
            console.log(esp32ConnectedCount);
            console.log(isESP32? "ESP32 Disconnected" : "Other Device Disconnected")
        })
    });

    return wss
}