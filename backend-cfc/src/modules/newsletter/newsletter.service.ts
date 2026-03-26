import { NewsletterSubscriber } from "./newsletter.model.js";
import { INewsletterSubscriber } from "./newsletter.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { verifyEmailDomain } from "../../shared/utils/dns.js";


export class NewsletterService {
  async subscribe(email: string): Promise<{ subscriber: INewsletterSubscriber; isNew: boolean }> {
    // 1. Verify the domain has MX records (domain exists and can receive mail) 
    await verifyEmailDomain(email);

    // 2. Check for existing subscription
    const existing = await NewsletterSubscriber.findOne({ email });

    if (existing) {
      if (existing.status === "active") {
        throw new AppError("This email is already subscribed to our newsletter.", 409);
      }
      // Re-activate unsubscribed user
      existing.status = "active";
      existing.subscribedAt = new Date();
      await existing.save();
      return { subscriber: existing, isNew: false };
    }

    const subscriber = await NewsletterSubscriber.create({ email });
    return { subscriber, isNew: true };
  }

  async getAllSubscribers(filters: Record<string, any> = {}): Promise<INewsletterSubscriber[]> {
    const query: Record<string, any> = {};
    if (filters.status) query.status = filters.status;
    return await NewsletterSubscriber.find(query).sort({ subscribedAt: -1 });
  }

  async getSubscriberById(id: string): Promise<INewsletterSubscriber> {
    const subscriber = await NewsletterSubscriber.findById(id);
    if (!subscriber) throw new AppError("Subscriber not found", 404);
    return subscriber;
  }

  async updateSubscriber(
    id: string,
    data: { status: "active" | "unsubscribed" }
  ): Promise<INewsletterSubscriber> {
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(id, data, { new: true });
    if (!subscriber) throw new AppError("Subscriber not found", 404);
    return subscriber;
  }

  async deleteSubscriber(id: string): Promise<void> {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!subscriber) throw new AppError("Subscriber not found", 404);
  }

  async getExportData(format: "csv" | "json" = "csv"): Promise<{ data: string; mimeType: string; filename: string }> {
    const subscribers = await NewsletterSubscriber.find({ status: "active" }).sort({ subscribedAt: -1 }).lean();

    if (format === "json") {
      const jsonData = JSON.stringify(
        subscribers.map((s) => ({
          email: s.email,
          status: s.status,
          subscribedAt: s.subscribedAt,
        })),
        null,
        2
      );
      return {
        data: jsonData,
        mimeType: "application/json",
        filename: `newsletter-subscribers-${Date.now()}.json`,
      };
    }

    // Default: CSV
    const header = "Email,Status,Subscribed At\n";
    const rows = subscribers
      .map(
        (s) =>
          `${s.email},${s.status},${new Date(s.subscribedAt).toISOString()}`
      )
      .join("\n");
    return {
      data: header + rows,
      mimeType: "text/csv",
      filename: `newsletter-subscribers-${Date.now()}.csv`,
    };
  }
}
