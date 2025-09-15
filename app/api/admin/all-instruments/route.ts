import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export async function GET(req:Request){
     try {
          const token = req.headers.get("cookie")?.split("admin_token=")[1]?.split(";")[0];
          if (!token) {
               return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
          try {
               const decoded=jwt.verify(token,process.env.ADMIN_JWT_SECRET!)   
          } catch{
               return NextResponse.json({ error: "Invalid token" }, { status: 403 });
          }

          const instruments= await db.instrument.findMany({
               orderBy:{createdAt:"desc"},
               select:{
                    id:true,
                    name:true,
                    createdAt:true,
               }
          })
          return NextResponse.json(instruments, { status: 201 });
  
                  
          } catch (err) {
                  console.error(err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
          }
          
          
                  

}