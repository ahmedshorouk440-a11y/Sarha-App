
import { BookingModle } from "../../modle/Booking.modle.js";




export const AddBooking=async(id , body)=>{
    try{
    let {BookingName , BookingDate , userId}= body
    if(!BookingName ||  !BookingDate || !userId){
        return ("BookingName and BookingDate , userId are required")
    }
        const date = new Date(BookingDate)
        if(isNaN(date)) return ("Invalid date")
            if(date < new Date()) return "Booking date cannot be in the past"
              let booking = await BookingModle.create({BookingName , BookingDate , userId})
              

              return booking

    }catch(error){
       throw error
    }
}

export const GetAllBooking= async(id , quary)=>{
    try{
        let page = Number(quary.page)
        let limit = Number(quary.limit)

        if(!page || page < 1) page=1
        if(!limit || limit <1)  limit = 1

        let skip = (page-1) * limit

      let data = await BookingModle.find({ }).skip(skip).limit(limit)

      return ({data , 
        limit,
        page
      })
    }catch(error){
     throw error
    }
}