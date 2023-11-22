import mongoose, { Schema, Document } from "mongoose";
interface OrderDoc extends Document {
  orderId: string;
  vandorId:string;
  items: [any];
  totalAmount: number;
  orderDate: Date;
  paidThrough: string;
  readyTime: string;
  paymentResponse: number;
  orderStatus:string;
  remarks:string;
  deliveryId:string;
  appliedOffers:boolean;
  offerId:string;
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    vandorId: { type: String, required: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidThrough: { type: String },
    readyTime: { type: String },
    paymentResponse: { type: Number },
    orderStatus:{type:String},
    remarks:{type:String},
    deliveryId:{type:String},
    appliedOffers:{type:Boolean},
    offerId:{type:String},
  },
  {
    toJSON: {
      transform(doc, res) {
        delete res.__v;
        delete res.createdAt;
        delete res.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>("Order", OrderSchema);
export { Order, OrderDoc };
