
import bcrypt from "bcrypt";

export const hash = async (plainText, saltRounds = Number(process.env.SALT) || 12) => {
  return bcrypt.hash(String(plainText), saltRounds);
};

export const compare = async (plainText, hashedResult) => {
  return bcrypt.compare(String(plainText), hashedResult);
};