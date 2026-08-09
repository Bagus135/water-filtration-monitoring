import { clients } from "./ws-server";

export function startHeartbeat (){
     return setInterval(()=>{
        for(const client of clients){
            const now = Date.now(); 
            if(!client.isEsp32)continue
            const lastSeen = client.lastSeen ?? 0; 
            const elapsed = now - lastSeen; 
            
            if(elapsed > 5000){
                console.log("ESP 32 timeout, forced terminate");
                client.terminate();
                continue;
            }
        }
    }, 3000)
}