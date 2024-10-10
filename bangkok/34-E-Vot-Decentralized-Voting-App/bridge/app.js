import express from "express"
import { addCandidate, toIpfs } from "./controllers/core"

const app = express()
const kycs = [
    {
        fullname:"Jon Doe",
        nim:"NG-2193-2411",
    }
]
app.use(express.json())

app.get("/candidate", (req,res)=>{
    res.json("holla")
})
app.post("/candidate", (req,res)=>{
    const data = addCandidate(req.body)    
    res.json("holla")
})

app.post("/election",(req,res)=>{
    try {
        
        const data =  toIpfs(req.body)
        res.status(201).json(data)
    } catch (error) {
        res.json({error: error?.message || "Error"})
    }

})

app.get("/kyc/:nim", (req, res)=>{
    const nim = req.params.nim
    const found = kycs.find((d,i)=>d.nim===nim)
    if (found!== "-1") {
        res.status(200).json(found)
    }
    res.status(400).json("KYC info not found")
    
})

app.post("/kyc", (req, res)=>{
    kycs.push(req.body)
    res.status(201).json("Success")
})

const port = process.env.port || "5000"
app.listen(port, ()=>{
    console.log("Server started on port ",port)
})