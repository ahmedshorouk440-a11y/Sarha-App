
import mongoose from "mongoose";
import { Role, ProviderEnum } from "../common/Enum/user.js";

const AuthScema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    picture: String,
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmail: Date,
    role: {
      type: Number,
      enum: Object.values(Role),
      default: Role.User,
    },
  },
  { timestamps: true }
);

export const AuthModle = mongoose.model("Authanction", AuthScema);