import mongoose, { Schema, Document, Model } from "mongoose";
interface FoodDoc extends Document {
    vandorId:string;
    name:string;
    description:string;
    category:string;
    foodType:string;
    readyTime:number;
    price:number;
    rating:number;
    images:[string];
}

const FoodSchema = new Schema ({
    vandorId:{type: String},
    name:{type: String, required:true},
    description:{type: String, required:true},
    category:{type: String},
    foodType:{type: String, required:true},
    readyTime:{type: Number},
    price:{type: Number, required:true},
    rating:{type: Number},
    images:{type: [String]},
},{
    toJSON:{
      transform(doc,res){
        delete res.__v;
        delete res.createdAt;
        delete res.updatedAt;
      }
    },
    timestamps: true,

  })

  const Food= mongoose.model<FoodDoc>('Food', FoodSchema);
export {Food,FoodDoc}