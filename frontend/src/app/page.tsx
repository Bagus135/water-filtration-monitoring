"use client"; 

import { useWaterQualitySocket } from "../hooks/useReadSocket";
import { StageReading } from "../types/types";
import { MetricRow } from "./component";

function fmt(val:number |undefined, digits=1) : string {
  return typeof val === "number" ? val.toFixed(digits) : "-"
}; 



export default function Home() { 
  const {reading, isESP32Connected} = useWaterQualitySocket(); 
  const before : StageReading = reading?.before ?? {}; 
  const after :StageReading = reading?.after?? {};

  return (
    <main className="max-w-270 mx-auto px-6 pt-8 pb-16 min-h-screen bg-[radial-gradient(ellipse_at_top, #0e1c2b,#0a1420_60%)] text-gray-500 font-black">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-10">
      <nav className="sticky border-b top-0 w-full bg-[rgba(28,26,41,0.9)] backdrop-blur-md z-50]">
        <div className="">
          <h1 className="text-[1.4rem] md:text-[1.85rem] font-semibold tracking-tight m-0">
            Water Quality Monitor
          </h1>
          <div className="text-[0.85rem] text-gray-500">
            Sebelum &amp; sesudah filtrasi 
          </div>
        </div>

        <div className={`items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full border ${
          isESP32Connected ? "text-green-400 border-2 border-green-400" : " border-2 border-gray-300"}`}>
            <span className={`w-1.75 h-1.75 rounded-full ${
              isESP32Connected ? "bg-clean motion-safe:animate-pulseglow": "bg-alert"
            }`}>
              {isESP32Connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </nav>
          
      {reading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] border border-border rounded-2xl overflow-hidden bg-surface">
            <div className="p-7 px-6 flex flex-col gap-[1.1rem]">
              <span className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-raw">
                Sebelum filtrasi
              </span>
              <MetricRow name="pH" value={fmt(before.ph, 2)} />
              <MetricRow name="Turbidity" value={fmt(before.turbidity)} unit="NTU" />
              <MetricRow name="TDS" value={fmt(before.tds, 0)} unit="ppm" />
            </div>
 
            <div className="w-full h-14 md:h-auto md:w-[72px] bg-surface2 flex items-center justify-center relative">
              <div className="h-1.5 w-full md:h-full md:w-1.5 rounded-full bg-gradient-to-r md:bg-gradient-to-b from-rawdim to-cleandim relative overflow-hidden">
                <div
                  className="absolute inset-0 motion-safe:animate-flowx md:motion-safe:animate-flowy
                  bg-[repeating-linear-gradient(to_right,transparent_0,transparent_8px,rgba(232,238,242,0.55)_8px,rgba(232,238,242,0.55)_10px)]
                  md:bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_8px,rgba(232,238,242,0.55)_8px,rgba(232,238,242,0.55)_10px)]"
                />
              </div>
              <div className="absolute w-[34px] h-[34px] rounded-full bg-bg border border-border flex items-center justify-center text-sm">
                💧
              </div>
            </div>
 
            <div className="p-7 px-6 flex flex-col gap-[1.1rem]">
              <span className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-clean">
                Sesudah filtrasi
              </span>
              <MetricRow name="pH" value={fmt(after.ph, 2)} />
              <MetricRow name="Turbidity" value={fmt(after.turbidity)} unit="NTU" />
              <MetricRow name="TDS" value={fmt(after.tds, 0)} unit="ppm" />
            </div>
          </div>
 
          <div className="mt-6 text-[0.8rem] text-muted font-mono">
            Update terakhir: {new Date(reading.timestamp).toLocaleString("id-ID")}
          </div>
        </>
      ) : (
        <div className="p-12 px-6 text-center text-muted border border-dashed border-border rounded-2xl font-mono text-[0.85rem]">
          Menunggu data dari sensor...
        </div>
      )}
      </div>
    </main>
  )
}