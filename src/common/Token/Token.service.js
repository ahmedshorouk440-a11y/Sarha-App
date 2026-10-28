import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { get } from "../../common/services/cash.service.js";
import { BadRequestExption } from "../../common/Excption/index.js";

export const userRevokeTokenKey=({userId , jti})=>{
  return `User::${userId}::Revoke_Token::${jti}`
}

export const checkRevokedToken = async ({ userId, jti }) => {
  const key = userRevokeTokenKey({ userId, jti });

  const revoked = await get({ key });  
     

  if (revoked) {
   throw "invalid , please login again "
  }
};

export const generateToken = (user) => {
  const jwtid = randomUUID();
  let Signature, RefreshSignature, aud;

  switch (user.Role) {
    case "1":
      Signature = "AdminSignature";
      RefreshSignature = "AdminRefreshSignature";
      aud = "Admin";
      break;
    default:
      Signature = "UserSignature";
      RefreshSignature = "UserRefreshSignature";
      aud = "User";
  }

  const accessToken = jwt.sign({ id: user._id }, Signature, {
    expiresIn: "30m",
    audience: aud,
    jwtid,
  });

  const refreshToken = jwt.sign({ id: user._id }, RefreshSignature, {
    expiresIn: "1y",
    audience: aud,
    jwtid,
  });

  return { accessToken, refreshToken };
};

export const generateAccessToken = async (refreshToken) => {
  const data = jwt.decode(refreshToken);
  if (!data) throw new Error("Invalid refresh token");

  let Signature, RefreshSignature;

  switch (data.aud) {
    case "Admin":
      Signature = "AdminSignature";
      RefreshSignature = "AdminRefreshSignature";
      break;
    case "User":
      Signature = "UserSignature";
      RefreshSignature = "UserRefreshSignature";
      break;
    default:
      throw new Error("Invalid token audience");
  }

  const decodedDataRefresh = jwt.verify(refreshToken, RefreshSignature);

  const accessToken = jwt.sign({ id: decodedDataRefresh.id }, Signature, {
    expiresIn: "30m",
    audience: data.aud,
    jwtid: randomUUID(),
  });

  return { accessToken };
};
