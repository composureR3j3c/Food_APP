import mongoose from "mongoose";
import { MONGO_URL } from "../config";

export default async ()=>{
mongoose
  .connect(MONGO_URL, {
    autoIndex: true, 
  })
  .then((result) => {
    console.log(`DB connected`)
  })
  .catch(err=>console.log(err));
}