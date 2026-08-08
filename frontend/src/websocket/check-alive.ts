import { clients } from "./ws-server";

export function startHeartbeat (){
     return setInterval(()=>{
        for(const client of clients){ 
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