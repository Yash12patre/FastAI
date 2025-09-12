import express from "express";
import cors from "cors"
import 'dotenv/config'
import { clerkMiddleware, requireAuth } from '@clerk/express'

const app = express()
const PORT=3000;
app.use(clerkMiddleware())

app.use(cors);
app.use(express.json());
app.use(requireAuth())
app.get('/',(req,res)=>res.send ("Server is live"));

app.listen(PORT,()=>{
    console.log(`the server is running on port ${PORT}`)
})




