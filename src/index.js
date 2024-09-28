import dotenv from "dotenv";
import connectdb from "./db/register.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });

connectdb()
    .then(() => {
        app.listen(process.env.PORT || 8000,() => {
            console.log("server running at port", process.env.PORT);
      })
    })
    .catch((err) => {
        console.log("database connection failed ", err);
})