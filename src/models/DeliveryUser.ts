import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from "./Order";
interface DeliveryUserDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  pincode: string;
  verified: boolean;
  lat: number;
  lng: number;
  isAvailable: boolean;
}

const DeliveryUserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String },
    pincode:{type:String},
    verified: { type: Boolean, required: true },

    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean },
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

const DeliveryUser = mongoose.model<DeliveryUserDoc>(
  "delivery_user",
  DeliveryUserSchema
);
export { DeliveryUser, DeliveryUserDoc };
