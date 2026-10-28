import { NotFoundExption } from "../../common/Excption/Excption.js";
import { MessageModle } from "../../modle/message.modle.js";
import { AuthModle } from "../../modle/Authanction.modle.js";


export const CreateMessage = async (
  { content, reciverId } = {},
  files = [],
  senderId,
  user = undefined,
) => {
  const checkReciver = await AuthModle.findById(reciverId);
  if (!checkReciver) {
    throw NotFoundExption("Invalid Reciver Id");
  }

  const message = await MessageModle.create({
    reciverId,
    senderId,
    content,
    attachment: files.map((file) => file.finalPath),
    ...(user ? { senderId: user._id } : {}),
  });

  return message;
};
export const GetAllMessage =  async ({ type } = {}, user, query = {}) => {
  let page = Number(query.page);
  let limit = Number(query.limit);

  if (!page || page < 0) page = 1;
   if (!limit || limit < 1) limit = 10;

  let skip = (page - 1) * limit;

  let filter = {};
  if (type == "0") {
    filter = { reciverId: user._id };
  } else if (type == "1") {
    filter = { senderId: user._id };
  } else {
    filter = {
      $or: [{ senderId: user._id }, { reciverId: user._id }],
    };
  }
  const messages = await find({
    model: MessageModle,
    filter: {
      ...filter,
    },

    options: {
      page,
      limit,
      skip,
       sort: { createdAt: -1 },
    },
  });
  return messages;
};
export const DeleteMessage=async({messageId}, user)=>{
  try{
     let data = await deleteOne({model:MessageModle,filter:{reciverId:user._id , _id:messageId}})
     if (!data.deletedCount){
      throw NotFoundExption("Invalid Message Id")
     }
  
    }catch(error){
    throw error

  }

}

export const GetMessageById= async({messageId},user)=>{
  try{
    let data = await MessageModle.findOne({
    _id: messageId,
    $or: [{ senderId: user._id }, { reciverId: user._id }],
  })
  if (!data){
    throw NotFoundExption("No Message Found")
  }
    return data
  }catch(error){
    throw error
  }

}