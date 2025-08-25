import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import { userRouter } from "./routes/user.routes.js";
import { itemRouter } from "./routes/itemsInfo.routes.js";
const app = express();

console.log("CORS_ORIGIN =", process.env.CORS_ORIGIN);

app.use(cors({
  origin: process.env.CORS_ORIGIN, 
  credentials: true,               
}));
 app.use(express.json({limit:'16kb'}));
 app.use(express.urlencoded({extended:true,limit:'16kb'}));
 app.use(express.static('public'));
 app.use(cookieParser());


// routes declaration
  app.use('/api/v1/users',userRouter);
  app.use('/api/v2',itemRouter);

export {app}