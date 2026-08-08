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
    <div className='flex items-baseline justify-between border-b border pb-[0.6rem] last:border-b-0 last:pb-0'>
      <span className='text-[0.85rem]'>
        <div
          className={`p-2 rounded-full bg-opacity-20 ${variant === "blue" ? "bg-blue-500" : "bg-green-500"}`}>
          {icon}
        </div>
        {name}
      </span>
      <span className='font-mono text-[1.4rem] font-medium'>
        {value}
        {unit && <span className='text-[0.75rem] ml-1'> {unit}</span>}
      </span>
    </div>
  );
}
