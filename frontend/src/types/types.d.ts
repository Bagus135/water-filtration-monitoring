export interface  StageReading{
    ph? : number;
    turbidity? : number; 
    tds? : number; 
}

export interface WaterQualityESP32Reading{
    before: StageReading;
    after : StageReading; 
}
export interface WaterQualityClientsReading extends WaterQualityESP32Reading{
   timestamp : string;
   device : string | undefined;
}

interface  UseWaterQualitySocketResult {
    reading : WaterQualityClientsReading | null; 
    isESP32Connected : boolean; 
}
