import mongoose, { Schema, Document, Model } from "mongoose";
interface OfferDoc extends Document {
  offerType: string;
  vandors: [any];
  title: string;
  description: string;
  minValues: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, require: true },
    vandors: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: "vandor",
    },],
    title: { type: String, require: true },
    description: String,
    minValues: { type: Number },
    offerAmount: { type: Number },
    startValidity: Date,
    endValidity: Date,
    promocode: { type: String, require: true },
    promoType: { type: String, require: true },
    bank: [{ type: String }],
    bins: [{ type: Number }],
    pincode: { type: String, require: true },
    isActive: Boolean,
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

const Offer = mongoose.model<OfferDoc>("Offer", OfferSchema);
export { Offer };
