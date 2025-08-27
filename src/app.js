import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { userRouter } from "./routes/user.routes.js";
import { itemRouter } from "./routes/itemsInfo.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  
  // Handle React Router (return `index.html` for all non-API routes)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// routes declaration
  app.use('/api/v1/users',userRouter);
  app.use('/api/v2',itemRouter);

export {app}