"use client";

import { useWaterQualitySocket } from "../hooks/useReadSocket";
import { StageReading } from "../types/types";
import { MetricRow } from "./component";
import { Droplets, Wifi, WifiOff, Atom, ArrowRight } from "lucide-react";

function fmt(val: number | undefined, digits = 1): string {
  return typeof val === "number" ? val.toFixed(digits) : "-";
}

export default function Home() {
  const { reading, isESP32Connected } = useWaterQualitySocket();
  console.log(isESP32Connected);
  const before: StageReading = reading?.before ?? {};
  const after: StageReading = reading?.after ?? {};

  return (
    <main className='max-w-270 mx-auto px-6 pt-8 pb-16 min-h-screen bg-[#020C1E]'>
      <div className='flex flex-col items-center justify-between flex-wrap gap-3 mb-10'>
        <nav className='sticky top-0 w-full flex justify-between items-center gap-5 px-4 py-3'>
          <div className='flex items-center gap-5'>
            <Droplets size={50} className='text-[#3B9BFF]' />

            <div>
              <h1 className='text-[#F5F7FA] text-[1.4rem] md:text-[1.85rem] lg:text-[2rem] font-semibold tracking-tight m-0'>
                Water Quality Monitor
              </h1>
              <p className='text-[0.85rem] lg:text-[1.5rem] text-[#A1A1AA]'>
                Sebelum &amp; sesudah filtrasi
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-3 lg:text-[1.4rem]'>
              <span
                className={`w-4 h-4 rounded-full ${isESP32Connected ? "bg-[#4ADE94]" : "bg-[#FF5572]"}`}></span>
              <span
                className={
                  isESP32Connected ? "text-[#4ADE94]" : "text-[#FF5572]"
                }>
                {isESP32Connected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className='w-1 h-8 bg-gray-600/50'></div>

            <div className='flex flex-col lg:text-[1.4rem]'>
              <span className='text-gray-400'>Update terakhir</span>
              <span className='text-white lg:text-[1.25rem]'>
                {reading
                  ? new Date(reading.timestamp).toLocaleString("id-ID")
                  : "—"}
              </span>
            </div>
          </div>
        </nav>

        <div className='flex items-center gap-3 border border-gray-800 rounded-2xl px-6 py-3 w-full bg-[#061428] shadow-md shadow-white/10'>
          {isESP32Connected ? (
            <>
              <div className='bg-[#073A2A] rounded-full p-2'>
                <Wifi size={40} className='text-[#32D583]' />
              </div>

              <div className='flex flex-col gap-1'>
                <span className='text-[1.4rem] font-bold text-[#32D583]'>
                  Connected
                </span>
                <span className='text-[1.25rem]'>
                  Perangkat terhubung. Sensor siap digunakan.
                </span>
              </div>
            </>
          ) : (
            <>
              <div className='bg-[#3D1420] rounded-full p-2'>
                <WifiOff size={40} className='text-[#FF5572]' />
              </div>

              <div className='flex flex-col gap-1'>
                <span className='text-[1.4rem] font-bold text-[#FF5572]'>
                  Disconnected
                </span>
                <span className='text-[1.25rem]'>
                  Perangkat tidak terhubung. Pastikan sensor aktif dan jaringan
                  stabil.
                </span>
              </div>
            </>
          )}
        </div>

        {reading ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] overflow-hidden w-full'>
              <div className='p-7 px-6 flex flex-col gap-[1.1rem] border border-gray-800 rounded-2xl bg-[#061428] shadow-md shadow-white/10'>
                <span className='font-mono text-[0.7rem] tracking-[0.12em] uppercase text-raw'>
                  Sebelum filtrasi
                </span>
                <MetricRow
                  name='pH'
                  value={fmt(before.ph, 2)}
                  icon={<span className='font-bold'>pH</span>}
                  variant='blue'
                />
                <MetricRow
                  name='Turbidity'
                  value={fmt(before.turbidity)}
                  unit='NTU'
                  icon={<Droplets size={20} />}
                  variant='blue'
                />
                <MetricRow
                  name='TDS'
                  value={fmt(before.tds, 0)}
                  unit='ppm'
                  icon={<Atom size={20} />}
                  variant='blue'
                />
              </div>

              <div className='w-full h-14 md:h-auto md:w-[72px] bg-surface2 flex items-center justify-center relative'>
                <div className='h-1.5 w-full md:h-full md:w-1.5 rounded-full bg-gradient-to-r md:bg-gradient-to-b from-rawdim to-cleandim relative overflow-hidden'>
                  <div
                    className='absolute inset-0 motion-safe:animate-flowx md:motion-safe:animate-flowy
                  bg-[repeating-linear-gradient(to_right,transparent_0,transparent_8px,rgba(232,238,242,0.55)_8px,rgba(232,238,242,0.55)_10px)]
                  md:bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_8px,rgba(232,238,242,0.55)_8px,rgba(232,238,242,0.55)_10px)]'
                  />
                </div>
                <div className='absolute w-[34px] h-[34px] rounded-full bg-bg border border-border flex items-center justify-center text-sm'>
                  💧
                </div>
              </div>

              <div className='p-7 px-6 flex flex-col gap-[1.1rem] border border-gray-800 rounded-2xl bg-[#061428] shadow-md shadow-white/10'>
                <span className='font-mono text-[0.7rem] tracking-[0.12em] uppercase text-clean'>
                  Sesudah filtrasi
                </span>
                <MetricRow
                  name='pH'
                  value={fmt(after.ph, 2)}
                  icon={<span className='font-bold'>pH</span>}
                  variant='green'
                />
                <MetricRow
                  name='Turbidity'
                  value={fmt(after.turbidity)}
                  unit='NTU'
                  icon={<Droplets size={20} />}
                  variant='green'
                />
                <MetricRow
                  name='TDS'
                  value={fmt(after.tds, 0)}
                  unit='ppm'
                  icon={<Atom size={20} />}
                  variant='green'
                />
              </div>
            </div>
          </>
        ) : (
          <div className='p-12 px-6 text-center text-muted border border-dashed border-border rounded-2xl font-mono text-[0.85rem] w-full bg-[#061428] shadow-md shadow-white/10'>
            Menunggu data dari sensor...
          </div>
        )}
      </div>
    </main>
  );
}
