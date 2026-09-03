/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AlertTriangle, Download, Loader2Icon } from "lucide-react";
import { Fragment, useState } from "react";

export function MetricRow({
  name,
  value,
  unit,
  icon,
  variant,
}: {
  name: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  variant: "blue" | "green";
}) {
  return (
    <div
      className={`flex items-center justify-between border-2 ${variant === "blue" ? "border-[#1769C2]" : "border-green-900"} rounded-md p-3`}>
      <div className='flex items-center gap-2'>
        <div
          className={`p-2 rounded-full bg-opacity-20 border ${variant === "blue" ? "bg-[#0B2747] text-[#4AA3FF] border-[#1769C2]" : "bg-[#073A2A] text-[#32D583] border-green-900"}`}>
          {icon}
        </div>
        <span className='font-bold text-base lg:text-2xl'>{name}</span>
      </div>

      <div>
        <span className='font-bold text-xl lg:text-3xl'>{value}</span>
        {unit && (
          <span className='text-sm lg:text-base font-normal text-gray-300'>
            {" "}
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function ExportModal (){
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownload = async() => {
    try {
      if(!startDate || !endDate) throw new Error("Start date and end date are required")
      
      setIsLoading(true)
      const params = new URLSearchParams(); 
      params.set("startDate", startDate);
      params.set("endDate", endDate);

      const res = await fetch(`api/export?${params.toString()}`)

      if (!res.ok){
        const err = await res.json();
        throw new Error(err.message);
      }

      const contentDisposition = res.headers.get("Content-Disposition"); 
      let filename = "water-quality.xlsx"

      if(contentDisposition){
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if(match){
          filename = match[1];
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob); 

      const a = document.createElement('a'); 
      a.href = url
      a.download = filename

      document.body.appendChild(a);
      a.click();
      a.remove(); 
      window.URL.revokeObjectURL(url);
      setErrorMsg("");
    } catch (error : any) {
      setErrorMsg(error.message as string); 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Fragment>
      <button 
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 text-xs md:text-base font-semibold px-3 py-1.5 rounded-xl border border-white-500 text-white-600 hover:text-white-500 hover:border-white-400 transition-colors cursor-pointer"
        >
          Export Data <Download className="size-4 group-hover:animate-[download_0.5s_ease-out]"/> 
      </button>
      {
        isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}  
          >
            <div 
              className="bg-[#04101F] rounded-2xl w-full max-w-sm p-6"
              onClick={(e)=> e.stopPropagation()}
            >
              <h2 className="font-bold text-lg mb-1 p-2">Export Data</h2>
              <div className="flex justify-center items-center gap-4 text-xs md:text-sm p-2 border-red-500 border bg-red-500/30 rounded-md">
                <AlertTriangle className="size-12 md:size-16 text-orange-400 font-bold"/> 
                <p>
                  Data exceeding 2 months will automatically expire and be purged
                </p>
              </div>
              <div className="flex flex-col py-6">
                <label htmlFor="start-date" className="text-xs mb-1">Start date</label>
                <input 
                  type="date" 
                  name="start-date" 
                  value={startDate}
                  onChange={(e)=>setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-400/40 text-sm focus:outline focus:outline-gray-500" 
                  />

                <label htmlFor="end-date" className="text-xs mb-1 mt-3">End date</label>
                <input 
                  type="date" 
                  name="end-date" 
                  value={endDate}
                  onChange={(e)=>setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-400/40 text-sm focus:outline focus:outline-gray-500" 
                  />
                <p className="text-left my-2 text-xs text-red-300">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-2 items-center justify-center">
                <button 
                  onClick={handleDownload}
                  className=" group cursor-pointer flex gap-2 justify-center items-center px-4 py-2 rounded-lg text-sm bg-sky-900 hover:bg-sky-950"
                  >{
                    isLoading ? 
                    <Loader2Icon className="animate-spin size-4"/> 
                    :
                    <Fragment>
                    <Download className="group-hover:animate-[download_0.5s_ease-out]"/>
                      Download
                    </Fragment>
                  }
                </button>
              </div>
            </div>
          </div>
        )
      }
    </Fragment>
  )
}