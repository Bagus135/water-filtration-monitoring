import {serverConfig } from './config/config';
import {createServer} from "http";
import {parse} from "url";
import next from "next";
import { clients, createWSServer } from './websocket/ws-server';
import { NextServer } from 'next/dist/server/next';
import { startHeartbeat } from './websocket/check-alive';

const app = next({
    dev : serverConfig.dev, 
    hostname : serverConfig.hostname,
    port: serverConfig.port
});

const handle = app.getRequestHandler();

app.prepare().then(()=>{
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url || "", true); 
        handle(req, res, parsedUrl); 
    }); 

    const wss = createWSServer(server, app as NextServer);
    const heartbeat = startHeartbeat();
    
    const shutdown = (signal : string) =>{
        console.log(`${signal} received \nShutting down server`)
        clearInterval(heartbeat); 
    
        for(const client of clients){
            client.close(1001 , "server shutting down");
        }
        
        wss.close(()=>{
            console.log("Web socket server closed");
            
        })
    
        server.close(()=>{
            console.log("HTTP server closed");
            process.exit(0)
        });
    }
    
    process.once('SIGTERM', () => {
      shutdown("SIGTERM");
    });
    
    process.once('SIGINT', () => {
        shutdown("SIGTERM");
    });
    
    server.listen(serverConfig.port, serverConfig.hostname, ()=>{
        console.log(`Server running on http://${serverConfig.hostname}:${serverConfig.port}`)
    });;
    
});

