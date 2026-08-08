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
   timestamp : string
}

interface UseWaterQualitySocketResult {
    reading : WaterQualityReading| null; 
    isESP32Connected : boolean; 
}
