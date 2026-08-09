import { clients } from "./ws-server";

export function startHeartbeat (){
     return setInterval(()=>{
        console.log("testing heartbeat running properly di render");
        
        for(const client of clients){
            console.log(`device = ${client.isEsp32}`);
            console.log(`lastSeen? = ${client.lastSeen}`);
            const now = Date.now(); 
            if(!client.isEsp32)continue
            const lastSeen = client.lastSeen ?? 0; 
            const elapsed = now - lastSeen; 
            console.log(`elapsed from esp32 ?${client.isEsp32} = ${elapsed}`);
            
            if(elapsed > 5000){
                console.log("ESP 32 timeout, forced terminate");
                client.terminate();
                continue;
            }
        }
    }, 3000)
}