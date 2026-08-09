"use client";

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
