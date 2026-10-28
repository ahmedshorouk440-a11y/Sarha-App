
import mongoose from "mongoose";


const MessageScema = new mongoose.Schema({
    content:{
       type:String ,
       required:function(){
        this.att?.length > 0 ? false : true
       },
       minLength:2,
       maxLength:50000
    },
    attachment:[String],
    senderId:{
        type:mongoose.Types.ObjectId, ref:"User",
    },
    reciverId:{type:mongoose.Types.ObjectId, ref:"User" , required:true}
    
})
export const MessageModle = mongoose.model ('Message' , MessageScema)