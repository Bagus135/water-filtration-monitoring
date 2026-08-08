import "dotenv/config";

export const serverConfig = {
    dev : process.env.NODE_ENV !== "production", 
    hostname : "0.0.0.0",
    port : parseInt(process.env.PORT || "3000", 10),
    token : process.env.TOKEN || ""
}