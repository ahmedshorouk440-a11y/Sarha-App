
import { Router } from "express";

import { AddBooking, GetAllBooking } from "./Booking.service.js";
import { auth } from "../../common/services/Token.middle.js";
const router = Router()


router.post("/AddBooking" , auth, async(req, res, next)=>{
    try{
       let data = await AddBooking(req.user.id,req.body)
       res.status(200).json({
        message: "Booking Added Successfully",
        data
       })
    }catch(error){
      next(error)
    }
})

router.get("/GetAllBooking" , auth , async(req, res, next)=>{
    try{

        let booking = await GetAllBooking(req.user.id , req.query)
        res.status(200).json({
            message : " All Bokking Fetched",
            booking
        })

    }catch(error){
      next(error)
    }
})


export default router