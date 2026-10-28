
import {ipKeyGenerator, rateLimit} from 'express-rate-limit'
 import axios from 'axios';
import geoip from 'geoip-lite'
import { client } from '../../database/redis.connection.js';



function Fromwhere(ip){
  
  try{
     return geoip.lookup(ip)
    }catch(error){
      console.log(error)
   }

 }
 export const generateLimiter =({
    ttl = 15,
     message = "Too Many Request",
      status =429,
       legacyHeaders = true,
   standardHeaders = "draft-8",
   limit = 1000
 })=>{
     return  rateLimit({
   windowMs:ttl *60*1000,
  legacyHeaders,
     standardHeaders,
   skipSuccessfulRequests: true,


  limit:function(req){
   const data=Fromwhere(req.ip);

  console.log({data})
  return data?.country == "EG" ? limit: 0
 },skipSuccessfulRequests:true,

  handler:function(req, res, next){
    return res.status(429).json({
    meesage : "Too Many Request"
   })
 }, keyGenerator:function(req){
   const ip = ipKeyGenerator(req.ip , 52)
     return `${ip}::${req.path}`
 }, 
 store:{
   async incr(key , cb){
    try{
      const count = await client.incr(key);
      if(count ===1){
       await client.expire(key ,ttl*60)
        }
       cb(null , count);

     }catch(err){
       cb(err)

      }
    }
  }
 });
 }


