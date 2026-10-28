
import "dotenv/config";
 import express from "express";
 import "./database/connection.js";
 import { main } from "./database/connection.js";
 import AuthRouter from "./module/Authanction/Authanction.controller.js";
 import BookingRouter from "./module/Booking/Booking.contrlloer.js";
 import MessageRouter from './module/message/message.contrlloer.js'
import path from "node:path";
import cors from 'cors';
import helmet from "helmet";
import { generateLimiter } from "./common/utiltes/limiter.js";
 import morgan from "morgan"
import { handler } from "./MiddleWare/ErrorHandle/index.js";


 const app = express();
 await main();



app.use(express.json());
var corsOptions = {
  origin: function (origin, callback) {
    if(!process.env.ORIGINS.includes(origin)){
       callback(new Error("unauthorized origin" ,{cause:{status:401}} ) , process.env.ORIGINS)
    }else{
      callback(null ,process.env.ORIGINS)
    }
   }
 }
 app.set("trust proxy" , true)
 const limiter = generateLimiter({limit : 10})
app.use((req, res, next)=>{
  if(!req.headers.origin){
      next(new Error("UnAuthoized origin", {cause:{status:401}}))
      return;
  }
  next()
}
 ,helmet() ,morgan("dev"),limiter,cors() , express.json())
 app.use(AuthRouter);

 app.use(BookingRouter);
 app.use(MessageRouter)
 app.use("/assets", express.static(path.resolve("./assets")));
 app.all("/" , (req, res)=> res.status(200).send(`<!DOCTYPE html>
 <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<script>alert("HACK")</script>
</body>
</html>`)

)
app.use(handler)

 app.listen(process.env.PORT, () => {
   console.log(`server is running on port ${process.env.PORT}`);
 });

