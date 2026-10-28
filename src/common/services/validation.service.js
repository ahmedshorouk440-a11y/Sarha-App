
import { BadRequestExption } from "../Excption/Excption.js"

export const validation = (schema) => {
  return (req, res, next) => {
    const { success, error } = schema.safeParse({
      body: req.body,
      files: req.files,
      params: req.params,
      query: req.query
    })

    if (!success) {
      console.log(error.issues)   
      throw BadRequestExption("Invalid data", error.issues)
    }

    next()
  }
}