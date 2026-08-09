import { clients } from "./ws-server";

export function startHeartbeat (){
     return setInterval(()=>{
        console.log("testing heartbeat running properly di render");
        
        for(const client of clients){
            console.log(`device = ${client.isEsp32}`);
            console.log(`alive? = ${client.isAlive}`);
            
            if(!client.isEsp32)continue

            if(!client.isAlive){
                console.log("ESP 32 disconnected, forced terminate");
                client.terminate();
                continue;
            }
            client.isAlive = false; 
            client.ping();
        }
    }, 3000)
}