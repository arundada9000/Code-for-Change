import jwt from "jsonwebtoken";
import { ENV } from "../configs/env.js";

export const generateToken = (payload: object) =>
  jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN } as any);

export const verifyToken = (token: string) =>
  jwt.verify(token, ENV.JWT_SECRET) as {
    id: string;
    role: string;
    permissions: string[];
  };

export const generateResetToken = (email: string) =>
  jwt.sign({ email, purpose: "password_reset" }, ENV.JWT_SECRET, { expiresIn: "10m" });

export const verifyResetToken = (token: string) =>
  jwt.verify(token, ENV.JWT_SECRET) as { email: string; purpose: string };

