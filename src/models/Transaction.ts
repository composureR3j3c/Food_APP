import mongoose, { Schema, Document, Model } from "mongoose";
interface TransactionDoc extends Document {
  customer: string;
  vandorId: string;
  orderId: string;
  orderValue: number;
  offerUsed: string;
  status: string;
  paymentMode: string;
  paymentResponse: string;
}

const TransactionSchema = new Schema(
  {
    customer: { type: String },
    vandorId: { type: String },
    orderId: { type: String },
    orderValue: { type: Number },
    offerUsed: { type: String },
    status: { type: String },
    paymentMode: { type: String },
    paymentResponse: { type: String },
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

const Transaction = mongoose.model<TransactionDoc>(
  "Transaction",
  TransactionSchema
);
export { Transaction, TransactionDoc };
