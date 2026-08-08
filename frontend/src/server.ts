import {createServer, IncomingMessage} from "http";
import {parse} from "url";
import next from "next";
import { WebSocketServer, WebSocket as WSCLient } from "ws";
import { WaterQualityClientsReading, WaterQualityESP32Reading } from "./types/types";

const dev = process.env.NODE_ENV !== "production"; 
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({dev, hostname, port});
const handle = app.getRequestHandler();



let lastReading : WaterQualityClientsReading; 
const clients = new Set<WSCLient>();

let esp32ConnectedCount : number = 0

function broadcastStatus(){
    const payload = JSON.stringify({
        type : "status", 
        espcount :  esp32ConnectedCount
    })
    for(const client of clients){
        if(client.readyState == WSCLient.OPEN){
            client.send(payload);
        }
    }
}


app.prepare().then(()=>{
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url || "", true); 
        handle(req, res, parsedUrl); 
    }); 

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

    wss.on("connection", (ws : WSCLient, req : IncomingMessage) =>{
        const {query} = parse(req.url || "", true);
        const isESP32 = query.role === "esp32"

        console.log( isESP32 ? "ESP32 connected" : "Other device");
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
        console.log("Data diterima :",  msg);

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

            console.log(isESP32? "ESP32 Disconnected" : "Other Device Disconnected")
        })
    });

    server.listen(port, hostname, ()=>{
        console.log(`Server running on http://${hostname}:${port}`)
    })
});
