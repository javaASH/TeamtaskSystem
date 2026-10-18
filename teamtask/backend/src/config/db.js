const mongoose = require("mongoose");

async function connectDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DATABASE is connected...!");
}

module.exports = connectDB;