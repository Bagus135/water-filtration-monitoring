"use client"

export function MetricRow({name, value, unit} : {name : string, value: string, unit? : string}){
    return(
        <div className="flex items-baseline justify-between border-b border pb-[0.6rem] last:border-b-0 last:pb-0">
            <span className="text-[0.85rem]">{name}</span>
            <span className="font-mono text-[1.4rem] font-medium">
                {value}
                {unit && <span className="text-[0.75rem] ml-1"> {unit}</span>}
            </span>
        </div>
    )
}