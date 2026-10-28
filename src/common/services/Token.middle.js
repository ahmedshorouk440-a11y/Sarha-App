

import jwt from "jsonwebtoken";
import { checkRevokedToken } from "../Token/Token.service.js";
import { BadRequestExption } from "../Excption/Excption.js";

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return next();               

    const [flag, token] = header.split(" ");
    if (flag !== "Bearer" || !token) {
      throw BadRequestExption("Invalid Token");
    }

    const decoded = jwt.decode(token);
    const signatures = { Admin: "AdminSignature", User: "UserSignature" };
    const signature = signatures[decoded?.aud];
    if (!signature) throw BadRequestExption("Invalid Token");

    const decodedData = jwt.verify(token, signature);
    await checkRevokedToken({ userId: decodedData.id, jti: decodedData.jti });

    req.user = decodedData;
    next();
  } catch (error) {
    next(error);
  }
};