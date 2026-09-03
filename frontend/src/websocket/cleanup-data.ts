import { prisma } from "../lib/prisma";

export async function cleanUpOldData(){
    const twoMonthsAgo = new Date(); 
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() -2); 

    try {
         const del = await prisma.sensorReading.deleteMany({
            where : { 
                timestamp : {
                    lt : twoMonthsAgo
                }
            }
        })
        console.log(`Clean up data succesfully ${del.count}`)
    } catch (err) {
        console.error("Failed to cleanup data", err)
    }
}