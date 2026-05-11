const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`\x1b[35m[VAULT]\x1b[0m MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\x1b[31m[FATAL]\x1b[0m MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Kill the server if the vault is offline
    }
};

module.exports = connectDB;