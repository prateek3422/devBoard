import crypto from "crypto";

export const generateOtp = (length: number = 6) => {
  if (length <= 0) {
    throw new Error("Length must be a positive number");
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  return parseInt(otp);
};

export const expairyToken = 20 * 1000 * 60; //20min
