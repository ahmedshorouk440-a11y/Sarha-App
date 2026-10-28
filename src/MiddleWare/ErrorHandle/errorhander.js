

export const handler=(err ,req , res, next)=>{
  res.status (Number(err.cause?.status) || 500).json({
    message : err.message,
    stack: err.stack
  })  

}