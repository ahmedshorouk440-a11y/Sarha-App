
import { Router } from "express";
import { fileValidtion, localFileUpload, processMulterUpload } from "../../common/utiltes/multer/multer.local.js";
import { CreateMessage, DeleteMessage ,  } from "./message.service.js";
import { validation } from "../../common/services/validation.service.js";
import * as validotors from './message.validtion.js'
import { auth } from "../../common/services/Token.middle.js";

const router = Router({caseSensitive: true , strict:true , mergeParams:true});
const messageFolderName = "messages";

router.post(
  "/message",
  auth,
  processMulterUpload({
    multerMiddleware: localFileUpload({ validation: fileValidtion.image }).array("attachment", 3),
    validation: fileValidtion.image,
    customPath: messageFolderName,
    isRequired: false
  }),
  validation(validotors.createmessage()),
  async (req, res, next) => {
    try {
      const data = await CreateMessage(req.body, req.files, req.user?.id);
      return res.status(201).json({ message: "Done", data });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/GetAllMessage" ,
     auth, 
       validation(validotors.allMessage)
     ,async(req, res, next)=>{
    try{
     let data = await GetAllMessage( req.query, req.validate.query, req.user)
     res.status(201).json({
        message : "All User Fetched",
        data
     })
    }catch(error){
next(error)
    }
})


router.delete("/DeleteMessage/:messageId" , auth,
   validation(validotors.DeleteMessage)
  ,async(req, res, next)=>{
  try{
     let data = await DeleteMessage(req.validate.params , req.user)
     res.status(200).json({
      message : " Message Deleted Successfully" ,
      data 
     })
  }catch(error){

  }
} )



router.get("/GetMessageById/:id" , auth , validation(validotors.GetMessageById) , async(req, res, next)=>{
  try{
   let data = await GetMessageById({ messageId: req.params.id },req.user)
   res.status(200).json({
    message : "User Fetched Successfully",
    data
   })
  }catch(error){
    next(error)
  }
})
export default router;