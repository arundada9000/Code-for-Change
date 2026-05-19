import { z } from "zod";

export const createDonationSchema = z.object({
  body: z.object({
    donorName: z.string().trim().min(1, "Donor name is required"),
    email: z.string().trim().email("Please provide a valid email address").optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    amount: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    paymentMethod: z.enum(['eSewa', 'Khalti', 'Bank Transfer', 'ConnectIPS', 'Cash', 'Card', 'Other']),
    category: z.string().trim().optional(),
    transactionId: z.string().trim().optional(),
    receiverAccount: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    receipt: z.string().optional(),
    isAnonymous: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
  }),
});

export const updateDonationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Verified', 'Rejected']),
  }),
  params: z.object({
    id: z.string().min(1, "Donation ID is required"),
  }),
});

export const updateDonationSchema = z.object({
  body: z.object({
    donorName: z.string().trim().optional(),
    email: z.string().trim().email("Please provide a valid email address").optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    amount: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    paymentMethod: z.enum(['eSewa', 'Khalti', 'Bank Transfer', 'ConnectIPS', 'Cash', 'Card', 'Other']).optional(),
    category: z.string().trim().optional(),
    transactionId: z.string().trim().optional(),
    receiverAccount: z.string().trim().optional(),
    status: z.enum(['Pending', 'Verified', 'Rejected']).optional(),
    remarks: z.string().trim().optional(),
    receipt: z.string().optional(),
    isAnonymous: z.union([z.string(), z.boolean()]).transform((val) => val === 'true' || val === true).optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Donation ID is required"),
  }),
});
