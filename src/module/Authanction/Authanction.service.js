import { compare, hash } from "../../common/Hash/index.js";
import { AuthModle } from "../../modle/Authanction.modle.js";

import { OAuth2Client } from "google-auth-library";
import {
  BadRequestExption,
  ConflictExption,
  NotFoundExption,
} from "../../common/Excption/Excption.js";
import { ProviderEnum } from "../../common/Enum/user.js";

import { emailEvent } from "../../common/Email/email.event.js";
import { EmailSubjectEnum } from "../../common/Enum/email.enum.js";
import { createOtp } from "../../common/otp.js";
import { del, get, set } from "../../common/services/index.js";
import {
  generateAccessToken,
  generateToken,
  userRevokeTokenKey,
} from "../../common/Token/Token.service.js";

export const otpKey = (email) =>
  `User :: ${email} :: ${EmailSubjectEnum.CONFIRM_EMAIL} :: OTP`;

export const forgetOtpKey = (email) =>
  `User :: ${email} :: ${EmailSubjectEnum.FORGOT_PAAWORD} :: OTP`;

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    BadRequestExption("invalid Google Token");
  }
  console.log("Goggle payload:", payload);

  if (!payload.email_verified) BadRequestExption("Email Not Verifed");
  return payload;
}

export const SignUpWithGmail = async ({ idToken }) => {
  if (!idToken) BadRequestExption("idToken is required");

  const { email, name, picture } = await verifyGoogleAccount(idToken);
  let user = await AuthModle.findOne({ email });
  if (user) {
    if (user.privider !== ProviderEnum.GOOGLE) {
      ConflictExption(
        "this email is registered with email and password , pleade login normally",
      );
    }
    return {
      message: "User Login Successfully",
    };
  }
  user = await AuthModle.create({
    FullName: name,
    email,
    picture,
    confrimEmail: new Date(),
    privider: ProviderEnum.GOOGLE,
  });
  return {
    message: "User Created Successfully",
  };
};
export const UpdateUser = async (id, body) => {
  try {
    let { FullName } = body;
    let user = await AuthModle.findByIdAndUpdate(
      id,
      { $set: { FullName } },
      { new: true, runValidtion: true },
    );

    if (!user) {
      return "User Not Found";
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const Logout = async (payload) => {
  const counsumedTime = Math.ceil(Date.now() / 1000) - payload.iat; //اللى استهلكته
  const refreshExpiresIn = 365 * 24 * 60 * 60; // مدة صلاحية الـ refresh token الكلية بالثواني (سنة)
  const remainingSeconds = payload.exp - Math.floor(Date.now() / 1000); // الوقت اللى فاضل على accessToken
  const ttl = refreshExpiresIn - counsumedTime; //بيحسب: كام ثانية فاضلة على انتهاء الـ refresh token
  await set({
    key: `User::${payload.id}::Revoke_Token::${payload.jti}`,
    value: payload.jti,
    ttl,
  });

  return;
};

export const SignUp = async (body) => {
  try {
    let { FullName, email, password } = body;
    let data = await AuthModle.create({
      FullName,
      email,
      password: await hash(password),
    });
    const code = createOtp();
    await set({
      key: `User :: ${email} :: ${EmailSubjectEnum.CONFIRM_EMAIL} :: OTP`,
      value: await hash(String(code)),
      ttl: 120,
    });
    emailEvent.emit("sendEmail", {
      recipients: { to: email },
      subject: EmailSubjectEnum.CONFIRM_EMAIL,
      data: { code },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const ConfirmEmail = async ({ otp, email }) => {
  const data = await AuthModle.findOne({
    email,
    provider: ProviderEnum.SYSTEM,
    confirmEmail: { $exists: false },
  });
  if (!data) throw NotFoundExption("Invalid account");

  const hashOtp = await get({ key: otpKey(email) });
  if (!hashOtp || !(await compare(String(otp), hashOtp))) {
    throw BadRequestExption("Invalid Otp");
  }

  data.confirmEmail = new Date();
  await data.save();
  await del({ key: otpKey(email) });

  return data;
};

export const requestForgetPasswordCode = async ({ email }) => {
  const account = await AuthModle.findOne({
    email,
    provider: ProviderEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });

  if (!account) return;

  const otp = String(createOtp());

  await set({ key: forgetOtpKey(email), value: await hash(otp), ttl: 600 });

  emailEvent.emit("sendEmail", {
    recipients: { to: email },
    subject: EmailSubjectEnum.FORGOT_PAAWORD,
    data: { code: otp, name: account.FullName },
  });
};
export const resetPassword = async ({ email, otp, password }) => {
  if (!email || !otp || !password) {
    BadRequestExption("email, otp and password are required");
  }

  const account = await AuthModle.findOne({
    email,
    provider: ProviderEnum.SYSTEM,
    confirmEmail: { $exists: true },
  });
  if (!account) BadRequestExption("Invalid or expired code");

  const hashOtp = await get({ key: forgetOtpKey(email) });
  if (!hashOtp || !(await compare(String(otp), hashOtp))) {
    BadRequestExption("Invalid or expired code");
  }

  console.log("resetPassword called for:", email);
  account.password = await hash(password);
  console.log("new hash:", account.password);
  await account.save();
  console.log("saved");

  await del({ key: forgetOtpKey(email) });
};

export const LoginAuth = async ({ email, password }) => {
  const user = await AuthModle.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const match = await compare(password, user.password);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateToken(user);
  return {
    message: "User Login Successfully",
    accessToken,
    refreshToken,
  };
};

export const GetUserById = async (id) => {
  let data = await AuthModle.findById(id);
  return data;
};
export const GetAllUser = async (quary) => {
  try {
    let page = Number(quary.page);
    let limit = Number(quary.limit);
    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 2;

    let skip = (page - 1) * limit;
    let user = await AuthModle.find({}).skip(skip).limit(limit);
    return {
      user,
      page,
      limit,
    };
  } catch (error) {
    throw error;
  }
};

export const GenerateAccessToken = async (body) => {
  let { RefreshToken } = body;
  let { accessToken } = await generateAccessToken(RefreshToken);
  if (accessToken) {
    return accessToken;
  } else {
    throw BadRequestExption("something went wrong");
  }
};
export const DeleteUser = async (id) => {
  const data = await AuthModle.findByIdAndDelete(id);
  if (!data) throw NotFoundExption("User Not Found");
  return { _id: data._id, email: data.email };
};
