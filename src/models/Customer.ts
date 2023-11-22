import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from "./Order";
interface CustomerDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lng: number;
  cart:[any];
  orders: [OrderDoc];
}

const CustomerSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String },
    verified: { type: Boolean, required: true },
    otp: { type: Number, required: true },
    otp_expiry: { type: Date, required: true },
    lat: { type: Number },
    lng: { type: Number },
    cart:[{
        food:{type: Schema.Types.ObjectId, ref:'Food',required:true},
        unit: {type:Number,required:true}
    }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order", required: true }],
  },
  {
    toJSON: {
      transform(doc, res) {
        delete res.salt;
        delete res.password;
        delete res.__v;
        delete res.createdAt;
        delete res.updatedAt;
      },
    },
    timestamps: true,
  } 
);

const Customer = mongoose.model<CustomerDoc>("customer", CustomerSchema);
export { Customer, CustomerDoc };
