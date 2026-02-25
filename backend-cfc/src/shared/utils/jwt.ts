import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET!;
const  expiresIn = "1d"

export const generateToken = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as {
    id: string;
    role: string;
    permissions: string[];
  };

export const generateResetToken = (email: string) =>
  jwt.sign({ email, purpose: "password_reset" }, JWT_SECRET, { expiresIn: "10m" });

export const verifyResetToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as { email: string; purpose: string };
