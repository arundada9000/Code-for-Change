import { Schema, model } from "mongoose";
import { IDonation } from "./donation.interface.js";

const donationSchema = new Schema<IDonation>(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    province: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['eSewa', 'Khalti', 'Bank Transfer', 'ConnectIPS', 'Cash', 'Other'],
      required: [true, "Payment method is required"],
    },
    category: {
      type: String,
      default: 'General',
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
    },
    receiverAccount: {
      type: String,
      required: [true, "Receiver account detail is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      trim: true,
    },
    receipt: {
      type: String,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Donation = model<IDonation>("Donation", donationSchema);
