import { NextResponse, NextRequest } from "next/server";
import ExcelJS from "exceljs"
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
    try{
        const {searchParams} = new URL(request.url);
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        if(!startDateParam || !endDateParam) {
            return NextResponse.json(
                {message : "missing param"},
                {status : 400}
            )
        }
        
        const startDate = new Date(`${startDateParam}T00:00:00+07:00`);
        const endDate = new Date(`${endDateParam}T23:59:59.999+07:00`);

        const readings = await prisma.sensorReading.findMany({
            where : {
                timestamp : {
                    gte : startDate, 
                    lte : endDate
                }
            },
            orderBy : {
                timestamp : "desc"
            }
        })

        const workbook = new ExcelJS.Workbook(); 
        const sheet = workbook.addWorksheet("Data"); 

        sheet.columns = [
            { header : "Device ID", key :"deviceId", width : 15 },
            { header : "Year", key :"year", width : 10 },
            { header : "Month", key :"month", width : 10 },
            { header : "Date", key :"date", width : 10 },
            { header : "Time", key :"time", width : 15 },
            { header : "pH Before", key :"phBefore", width : 15 },
            { header : "Turbidity Before", key :"turbidityBefore", width : 15 },
            { header : "TDS Before", key :"tdsBefore", width : 15 },
            { header : "pH After", key :"phAfter", width : 15 },
            { header : "Turbidity After", key :"turbidityAfter", width : 15 },
            { header : "TDS After", key :"tdsAfter", width : 15 },
        ]

        sheet.getRow(1).font = {bold : true}; 

        for(const r of readings){
            const date = new Date(r.timestamp); 
            const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

            sheet.addRow({
                deviceId : r.deviceId,
                year : wib.getFullYear(), 
                month : wib.getMonth() + 1, 
                date : wib.getDate(),
                time : wib.toLocaleTimeString("id-ID", {
                    hour : "2-digit",
                    minute : "2-digit", 
                    second : "2-digit"
                }),
                phBefore : r.phBefore,
                turbidityBefore : r.turbidityBefore, 
                tdsBefore : r.tdsBefore, 
                phAfter : r.phAfter, 
                turbidityAfter : r.turbidityAfter, 
                tdsAfter : r.tdsAfter,
            })
        }
        const  buffer = await workbook.xlsx.writeBuffer(); 
        
        const startDatelabel = startDate.toLocaleDateString("id-ID", {
            day : "2-digit", 
            month : "2-digit", 
            year : "numeric"
        }); 

        const endDateLabel = endDate.toLocaleDateString("id-ID",{
            day : "2-digit", 
            minute : "2-digit", 
            year : "2-digit"
        })
        const filenameLabel = `Data Water Quality ${startDatelabel} - ${endDateLabel}.xlsx`
        
        return new NextResponse(buffer, {
            status : 200, 
            headers : {
                "Content-Type" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition" : `attachment; filename="${filenameLabel}"`,
            }
        })
    } catch (err){
        console.log("Error on export handler : ", err)
        return NextResponse.json(
            {message : "Internal Server Error"},
            {status : 500},
        )
    }
}