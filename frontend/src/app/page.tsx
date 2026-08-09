"use client";

import { useWaterQualitySocket } from "../hooks/useReadSocket";
import { StageReading } from "../types/types";
import dateParse from "../utils/parse-date";
import { MetricRow } from "./component";
import {
  Droplets,
  Wifi,
  WifiOff,
  Atom,
  ArrowRight,
  ArrowDown,
  Microchip,
  
} from "lucide-react";

function fmt(val: number | undefined, digits = 1): string {
  return typeof val === "number" ? val.toFixed(digits) : "-";
}

export default function Home() {
  const { reading, isESP32Connected} = useWaterQualitySocket();
  const before: StageReading = reading?.before ?? {};
  const after: StageReading = reading?.after ?? {};

  const formattedTimestamp = dateParse(reading?.timestamp)
  return (
    <main
      className={`px-4 md:px-6 py-8 flex flex-col items-center min-h-screen md:justify-center ${
        reading ? "justify-center" : "justify-start"
      }`}>
      <div className='flex flex-col gap-6 md:gap-8 w-full max-w-350 mx-auto h-full md:bg-[#04101F] md:border md:border-gray-800 md:p-10 md:rounded-2xl md:shadow-md md:shadow-white/10'>
        <nav className='w-full flex justify-between items-center gap-5 md:px-4 md:py-3'>
          <div className='flex items-center gap-5'>
            <Droplets className='text-[#3B9BFF] w-10 h-10 lg:w-14 lg:h-14' />

            <div>
              <h1 className='text-[#F5F7FA] text-lg lg:text-3xl font-semibold tracking-tight m-0'>
                Water Quality Monitor
              </h1>
              <p className='text-sm lg:text-xl text-[#A1A1AA]'>
                Before &amp; After Filtration
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='hidden md:flex items-center gap-3'>
              <span
                className={`w-4 h-4 rounded-full ${isESP32Connected ? "bg-[#4ADE94]" : "bg-[#FF5572]"}`}></span>
              <span
                className={`text-base lg:text-2xl ${isESP32Connected ? "text-[#4ADE94]" : "text-[#FF5572]"}`}>
                {isESP32Connected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className='w-1 h-12 bg-gray-600/50'></div>

            <div className='flex flex-col'>
              <span className='text-gray-400 text-base lg:text-2xl'>
                Last Update
              </span>
              <span className='text-white text-sm lg:text-xl'>
                { !formattedTimestamp ? 
                "-" : (
                  <>
                    <p>
                      {formattedTimestamp.date}/{formattedTimestamp.month}/{formattedTimestamp.year}
                    </p>
                    <p>
                        {formattedTimestamp.hours}:{formattedTimestamp.minutes}:{formattedTimestamp.seconds}
                    </p>
                  </>
                    )}
              </span>
            </div>
          </div>
        </nav>

        <div className='flex items-center justify-between gap-3 border border-gray-800 rounded-2xl px-6 py-3 w-full bg-[#061428] shadow-md shadow-white/10'>
          {isESP32Connected ? (
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center bg-[#073A2A] rounded-full w-10 h-10 lg:w-[50px] lg:h-[50px]'>
                <Wifi className='text-[#32D583] w-5 h-5 lg:w-6 lg:h-6' />
              </div>

              <div className='flex flex-col gap-1'>
                <span className='text-base lg:text-2xl font-bold text-[#32D583]'>
                  Connected
                </span>
                <span className='text-sm lg:text-xl'>
                  Device connected. Sensor ready for use.
                </span>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center bg-[#3D1420] rounded-full w-10 h-10 lg:w-[50px] lg:h-[50px]'>
                <WifiOff className='text-[#FF5572] w-5 h-5 lg:w-6 lg:h-6' />
              </div>

              <div className='flex flex-col gap-1'>
                <span className='text-base lg:text-2xl font-bold text-[#FF5572]'>
                  Disconnected
                </span>
                <span className='text-sm lg:text-xl'>
                  The device is not connected. Ensure the sensor is active and
                  the network is stable.
                </span>
              </div>
            </div>
          )}

          {/* Device Info */}
          <div className='flex flex-col gap-1'>
            <span className='text-[#1769C2] text-xs lg:text-base font-semibold uppercase'>
              Device
            </span>
            <div className='flex items-center gap-3'>
              <Microchip className='w-5 h-5 lg:w-6 lg:h-6' />

              <span className='text-base lg:text-xl font-semibold'>
                {reading?.device || "-"}
              </span>
            </div>
          </div>
        </div>

        {reading ? (
          <>
            <div className='grid grid-cols-1 lg:grid-cols-[1fr_72px_1fr] overflow-hidden w-full gap-4 md:gap-6'>
              <div className='p-4 md:py-7 md:px-6 flex flex-col justify-center gap-6 border border-gray-800 rounded-2xl bg-[#061428] shadow-md shadow-white/10'>
                <span className='font-mono text-sm lg:text-lg tracking-[0.12em] uppercase font-semibold'>
                  Before Filtration
                </span>
                <MetricRow
                  name='pH'
                  value={fmt(before.ph, 2)}
                  icon={
                    <span className='font-bold text-base lg:text-2xl'>pH</span>
                  }
                  variant='blue'
                />
                <MetricRow
                  name='Turbidity'
                  value={fmt(before.turbidity)}
                  unit='NTU'
                  icon={<Droplets className='w-4 h-4 lg:w-6 lg:h-6' />}
                  variant='blue'
                />
                <MetricRow
                  name='TDS'
                  value={fmt(before.tds, 0)}
                  unit='ppm'
                  icon={<Atom className='w-4 h-4 lg:w-6 lg:h-6' />}
                  variant='blue'
                />
              </div>

              <div className='flex md:flex-col items-center justify-center relative w-full lg:w-auto h-16 lg:h-auto '>
                {/* Garis putus-putus: horizontal di mobile, vertikal di desktop */}
                <div className='w-full lg:w-px h-px lg:h-full border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-gray-400'></div>

                {/* Wrapper panah */}
                <div className='absolute top-1/2 -translate-y-1/2 bg-[#020C1E] border border-gray-400 rounded-full p-3 z-10'>
                  <ArrowDown
                    className='block lg:hidden text-blue-500'
                    size={24}
                  />
                  <ArrowRight
                    className='hidden lg:block text-blue-500'
                    size={24}
                  />
                </div>
              </div>

              <div className='p-4 md:py-7 md:px-6 flex flex-col gap-6 border border-gray-800 rounded-2xl bg-[#061428] shadow-md shadow-white/10'>
                <span className='font-mono text-sm lg:text-lg tracking-[0.12em] uppercase font-semibold'>
                  After Filtration
                </span>
                <MetricRow
                  name='pH'
                  value={fmt(after.ph, 2)}
                  icon={
                    <span className='font-bold text-base lg:text-2xl'>pH</span>
                  }
                  variant='green'
                />
                <MetricRow
                  name='Turbidity'
                  value={fmt(after.turbidity)}
                  unit='NTU'
                  icon={<Droplets className='w-4 h-4 lg:w-6 lg:h-6' />}
                  variant='green'
                />
                <MetricRow
                  name='TDS'
                  value={fmt(after.tds, 0)}
                  unit='ppm'
                  icon={<Atom className='w-4 h-4 lg:w-6 lg:h-6' />}
                  variant='green'
                />
              </div>
            </div>
          </>
        ) : (
          <div className='p-12 px-6 text-center text-muted border border-dashed border-border rounded-2xl font-mono text-sm lg:text-lg w-full bg-[#061428] shadow-md shadow-white/10'>
            Waiting for data from sensor...
          </div>
        )}
      </div>
    </main>
  );
}
