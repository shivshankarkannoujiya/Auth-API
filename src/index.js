import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log(`ERR: ${error}`);
            process.exit(1);
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening at PORT: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log(`MongoDB connection Failed,ERROR: ${error}`);
    });
