require("dotenv").config();

const  app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000

async function startServer()
{
    try{
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on the port ${PORT}`);
        });
    }catch (error){
        console.error("FAILED to start server:", error.message);
        process.exit(1);
    }

}
// last-resort logging so a stray error never dies silently
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    // process state is unknown after this, so exit and let nodemon / the host restart it
    process.exit(1);
});

startServer();