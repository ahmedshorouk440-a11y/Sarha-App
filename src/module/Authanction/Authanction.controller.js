import { Router } from "express";
import {
  ConfirmEmail,
  GenerateAccessToken,
  GetAllUser,
  GetUserById,
  LoginAuth,
  Logout,
  requestForgetPasswordCode,
  resetPassword,
  SignUp,
  SignUpWithGmail,
  UpdateUser,
} from "./Authanction.service.js";
import { auth } from "../../common/services/Token.middle.js";

import {
  fileValidtion,
  localFileUpload,
  processMulterUpload,
} from "../../common/utiltes/multer/multer.local.js";
import { del, ttl } from "../../common/services/cash.service.js";
import { generateLimiter } from "../../common/utiltes/limiter.js";
import { SuccessRespose } from "../../common/Respose/index.js";

const router = Router();

router.post("/SignUp", async (req, res, next) => {
  try {
    let data = await SignUp(req.body);
        return SuccessRespose({ res, message: "User Created Successfully", data });
  } catch (error) {
    next(error);
  }
});

router.patch("/Confirm_Email", async (req, res, next) => {
  try {
    let data = await ConfirmEmail(req.body);
    res.status(200).json({
      message: "Email Confired",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/SignUpWithGoogle", async (req, res, next) => {
  try {
    let user = await SignUpWithGmail(req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/LogOut", auth, async (req, res, next) => {
  try {
    let data = await Logout(req.user, req.body);
    res.status(200).json({
      message: "User Logout ",
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/requestForgetPasswordCode", async (req, res, next) => {
  try {
    await requestForgetPasswordCode(req.body);
    res.status(200).json({
      message: "If the email exists, a code was sent",
    });
  } catch (error) {
    next(error);
  }
});
router.patch("/resetPassword", async (req, res, next) => {
  try {
    await resetPassword(req.body);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/profile-image",
  auth,
  localFileUpload({ maxFileSize: 3, validation: fileValidtion.image }).single(
    "attachment",
  ),
  processMulterUpload({ customPath: "users", validation: fileValidtion.image }),
  async (req, res, next) => {
    req.user.image = req.file.finalPath;
    return res.status(200).json({
      message: "User Upload File",
      data: {
        user: req.user,
      },
    });
  },
);

const loginLimiter = generateLimiter({ limit: 5, ttl: 5 });
router.post("/Login", loginLimiter, async (req, res, next) => {
  try {
    let data = await LoginAuth(req.body);
    await del({ key: req.rateLimit.key });
    res.status(200).json({
      message: "User Login Successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/GetUserById", auth, async (req, res, next) => {
  try {
    let user = await GetUserById(req.user.id);
    res.status(200).json({
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});
router.put("/UpdateUser", auth, async (req, res, next) => {
  try {
    let user = await UpdateUser(req.user.id, req.body);
    res.status(200).json({
      message: "User Updated Successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/GetAllUser", async (req, res, next) => {
  try {
    let user = await GetAllUser(req.query);
    res.status(200).json({
      message: "Users Fetched",
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/Generate-access-token", async (req, res, next) => {
  try {
    let data = await GenerateAccessToken(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
router.delete("/DeleteAuth" , auth,async(req, res, next)=>{
  try{
    let data = await DeleteUser(req.user.id)
    res.status(200).json({
      message: "User Deleted Successfully",
      data
    })
  }catch(error){
   next(error)
  }
})

export default router;
