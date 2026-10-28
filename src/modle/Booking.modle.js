
import mongoose from "mongoose";


const BookingScema = mongoose.Schema({
    BookingName:{
        type: String,
        required:true
    },
    BookingDate: Date,
    userId:{ type: mongoose.Schema.Types.ObjectId ,
        ref:"Authanction",}
    
})

export const BookingModle = mongoose.model('Booking' , BookingScema)
