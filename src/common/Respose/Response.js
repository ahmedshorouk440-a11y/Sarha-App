
export const SuccessRespose=({res ,
     status=200 ,
     message ="Done" ,
      data="Undefined" }={})=>{

 return res.status(status).json({
    message,
    ...(data !== undefined && {data}),
 })
}