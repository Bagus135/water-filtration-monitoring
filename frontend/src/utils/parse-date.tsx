export default function dateParse(date :string|undefined){
    console.log(date);
    
    if(!date) return null
    const dateparse = new Date(date)
    const formattedTimestamp = {
        date :  String(dateparse.getDate()).padStart(2, "0"),
        month :  String(dateparse.getMonth() + 1).padStart(2, "0"),
        year : dateparse.getFullYear(), 
        hours :  String(dateparse.getHours()).padStart(2, "0"),
        minutes :  String(dateparse.getMinutes()).padStart(2, "0"),
        seconds :  String(dateparse.getSeconds()).padStart(2, "0"),
    }

    return formattedTimestamp;
}