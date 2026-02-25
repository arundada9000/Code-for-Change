import { Donation } from "./donation.model.js";
import { IDonation } from "./donation.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import crypto from "crypto";
import { ENV } from "../../shared/configs/env.js";

export class DonationService {
  private generateSignature(message: string): string {
    return crypto
      .createHmac("sha256", ENV.ESEWA_SECRET_KEY)
      .update(message)
      .digest("base64");
  }

  async initiateESewaPayment(data: {
    amount: number;
    donorName: string;
    email?: string;
    phone?: string;
    category?: string;
  }) {
    const transactionId = `CFC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create a pending donation record
    const donation = await Donation.create({
      ...data,
      transactionId,
      paymentMethod: "eSewa",
      status: "Pending",
      receiverAccount: "Code for Change eSewa",
    });

    // Prepare eSewa signature
    // eSewa v2 requires the signatures to use the EXACT string representation of the numbers sent in the form.
    const amountStr = data.amount.toString();
    const signatureMessage = `total_amount=${amountStr},transaction_uuid=${transactionId},product_code=${ENV.ESEWA_PRODUCT_CODE}`;
    const signature = this.generateSignature(signatureMessage);

    return {
      amount: amountStr,
      tax_amount: "0",
      total_amount: amountStr,
      transaction_uuid: transactionId,
      product_code: ENV.ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${ENV.FRONTEND_URL}/donation-success`,
      failure_url: `${ENV.FRONTEND_URL}/donation-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
      esewa_url: ENV.ESEWA_GATEWAY_URL,
    };
  }

  async verifyESewaPayment(encodedResponse: string) {
    // Decode eSewa response (usually Base64 encoded JSON)
    const decodedString = Buffer.from(encodedResponse, "base64").toString("utf-8");
    const response = JSON.parse(decodedString);

    const { transaction_code, status, total_amount, transaction_uuid, product_code, signature, signed_field_names } = response;

    if (status !== "COMPLETE") {
      throw new AppError("Payment was not completed", 400);
    }

    // Verify signature for eSewa v2 Success Redirect
    // The message format must match the fields in signed_field_names
    // Format: "transaction_code=VALUE,status=VALUE,total_amount=VALUE,transaction_uuid=VALUE,product_code=VALUE,signed_field_names=VALUE"
    const signatureMessage = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
    const expectedSignature = this.generateSignature(signatureMessage);

    if (signature !== expectedSignature) {
      throw new AppError("Invalid payment signature. Potential fraud detected.", 400);
    }

    // Verification with eSewa API (Double check)
    // In production, you would call eSewa's verification endpoint here.
    // For now, we trust the signature and update our record.

    const donation = await Donation.findOneAndUpdate(
      { transactionId: transaction_uuid },
      { 
        status: "Verified",
        verifiedAt: new Date(),
        remarks: `eSewa Transaction: ${transaction_code}`,
      },
      { new: true }
    );

    if (!donation) {
      throw new AppError("Donation record not found for this transaction", 404);
    }

    return donation;
  }

  async createDonation(data: Partial<IDonation>) {
    // For manual/unverified donations, generate a temporary transaction ID if not provided
    if (!data.transactionId) {
      data.transactionId = `CFC-MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    if (!data.receiverAccount) {
      data.receiverAccount = "Manual/Pledge";
    }

    const existing = await Donation.findOne({ transactionId: data.transactionId });
    if (existing) {
      throw new AppError("A donation with this Transaction ID already exists", 400);
    }
    return await Donation.create(data);
  }

  async getAllDonations(queryParams: any = {}) {
    const { province, ...otherFilters } = queryParams;
    const query: any = { ...otherFilters };
    
    if (province && province !== 'all') {
      query.province = province;
    }
    
    return await Donation.find(query).sort({ createdAt: -1 });
  }

  async getDonationById(id: string) {
    const donation = await Donation.findById(id);
    if (!donation) {
      throw new AppError("Donation record not found", 404);
    }
    return donation;
  }

  async updateDonationStatus(id: string, status: string, verifiedBy?: string) {
    const updateData: any = { status };
    if (status === 'Verified') {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = verifiedBy;
    }
    const donation = await Donation.findByIdAndUpdate(id, updateData, { new: true });
    if (!donation) {
      throw new AppError("Donation record not found", 404);
    }
    return donation;
  }

  async updateDonation(id: string, data: Partial<IDonation>) {
    const donation = await Donation.findByIdAndUpdate(id, data, { new: true });
    if (!donation) {
      throw new AppError("Donation record not found", 404);
    }
    return donation;
  }

  async getDonationStats() {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $cond: [{ $eq: ["$status", "Verified"] }, "$amount", 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Verified"] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || { totalAmount: 0, pendingCount: 0, verifiedCount: 0 };
  }
}
