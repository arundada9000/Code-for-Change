import { Document } from "mongoose";

export interface IDonation extends Document {
  donorName: string;
  email?: string;
  phone?: string;
  amount: number;
  province?: string;
  paymentMethod: 'eSewa' | 'Khalti' | 'Bank Transfer' | 'ConnectIPS' | 'Cash' | 'Card' | 'Other';
  category: string;
  transactionId: string;
  receiverAccount: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  remarks?: string;
  receipt?: string;
  isAnonymous: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
