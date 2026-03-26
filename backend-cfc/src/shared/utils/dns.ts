import dns from "dns";
import { AppError } from "./errorHandler.js";

/**
 * Verifies the email domain has valid MX records.
 * Confirms the domain is capable of receiving emails.
 * Uses Node's built-in dns module — no external API required.
 */
export async function verifyEmailDomain(email: string): Promise<void> {
  const domain = email.split("@")[1];

  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new AppError(
        "The email domain does not appear to accept emails. Please use a real email address.",
        422
      );
    }
  } catch (err: unknown) {
    // Re-throw our own errors (e.g. empty MX records above)
    if (err instanceof AppError) throw err;

    // DNS errors: ENOTFOUND (domain doesn't exist), ENODATA (no MX record), etc.
    throw new AppError(
      "We couldn't verify this email domain. Please use a valid, real email address.",
      422
    );
  }
}
