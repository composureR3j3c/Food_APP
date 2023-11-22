import mongoose, { Schema, Document, Model } from "mongoose";

interface VandorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  coverImages: [string];
  rating: number;
  foods: any;
}

const VandorSchema = new Schema(
  {
    name: { type: String },
    ownerName: { type: String },
    foodType: { type: [String] },
    pincode: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    salt: { type: String },
    serviceAvailable: { type: Boolean },
    coverImages: { type: [String] },
    rating: { type: Number },
    foods: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Food",
      },
    ],
  },
  {
    toJSON:{
      transform(doc,res){
        delete res.salt;
        delete res.password;
        delete res.__v;
        delete res.createdAt;
        delete res.updatedAt;
      }
    },
    timestamps: true,

  }
);


const Vandor= mongoose.model<VandorDoc>('vandor', VandorSchema);
export {Vandor}