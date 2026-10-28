
import mongoose from 'mongoose'
import { z } from 'zod'
import { validation } from '../../common/services/validation.service.js'

export const createmessage = (lang) => {
  return z
    .object({
      body: z.strictObject({
        reciverId: z
          .string()
          .refine((data) => mongoose.Types.ObjectId.isValid(data), {
            message: "Invalid Format"
          }),
        content: z.string().min(2).max(50000).optional()
      }),
      files: z
        .array(
          z.object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            buffer: z.instanceof(Buffer),
            size: z.number(),
            finalPath: z.string().optional()
          })
        )
        .optional()
    })
    .superRefine((data, ctx) => {
      if (!data.body.content && !data.files?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["body", "content"],
          message: "missing message content"
        })
      }
    })
}


export const allMessage =()=>{
  return z.object({
    query:z.strictObject({
      type:z.enum(["0" , "1" , "2"]).default("0"),
          page:z.coerce.number().default(1),
          limit :z.coerce.number().default(3)
    }),
  })
}

export const DeleteMessage=()=>{
  return z.object({
    params : z.strictObject({
      messageId: validation.id(),
    })
  })
}

export const GetMessageById=()=>{
  return z.object({
    params: z.strictObject({
         messageId: validation.id(),

    })
  })
}