const Schedule = require("../models/schedule.model");
const {sit_gene}=require("../reusable_logic/sit_generator")
const moment=require('moment')
//transfer schedule request will send request notification to other org nothing more
exports.scheduleTransferRequest = async (req, res, next) => {
  try {
   const schedule_id=req.body.scheduleid
   //find unique socket of organization that we want to send request notification
  //  const socket_id=req.body.scoketid
  // io.getIo().emit({action:"transfer request",value:schedule_id})
   res.json("request sent successfully")
  }
  catch(error) {
    next(error)
  }
};
// accept transfer schedule
exports.acceptScheduleTransferRequest = async (req, res, next) => {
  const session=await Schedule.startSession()
  try {
    session.startTransaction();
   const schedule_id=req.query.scheduleid
   const transfer_info=await Schedule.aggregate([
     {$match:{_id:schedule_id}},
     {$project:{source:1,destination:1,tarif:1,passangerInfo:1,departureDateAndTime:1,numberOfPassanger:{$size:"$occupiedSitNo"},occupiedSit1:"$occupiedSitNo"},
     }
   ])
   //find the intersection of the two occupied sit
   const for_schedule_accepting =await Schedule.findOne(
    {source:transfer_info.source,distination:transfer_info.destination,departureDateAndTime:transfer_info.departureDateAndTime,
     $expr:{$gte:[{$subtract:["$totalNoOfSit",{$size:"$occupiedSitNo"}]},transfer_info.numberOfPassanger]}})
let occupied1 = transfer_info.occupiedSit1;
let occupied2 = for_schedule_accepting.occupiedSitNo;
const intersection = occupied1.filter(element => occupied2.includes(element));
let only_in_occupied1=occupied1.filter((elem=>!occupied2.includes(elem)))
//generate unique number which is not in occpied2 if there is an intersection
const generated_sit=[]
const final_transfer_sit=[]

if(intersection.length>0)
{
for (let i=0;i<intersection.length; i++)
{
  let sit=sit_gene(1, 49)
  generated_sit.push(sit)
}
 final_transfer_sit=[...only_in_occupied1,...generated_sit]
}
  //transfer maping for userinfo info
  const add_passanger_info=transfer_info.passangerInfo.map((elem)=>{
    const each_intersection = elem.passangerOccupiedSitNo.filter(eachelem => occupied2.includes(eachelem));
    let each_pass_sit=elem.passangerOccupiedSitNo.map((esit)=>
    {
       if(each_intersection.includes(esit))
       {
         return generated_sit.splice(-1)[0]
        }
        else {return esit}
    })
    return {...elem,passangerOccupiedSitNo:each_pass_sit}
  })
   //find and insert to shedule which can accomodate those passanger in given date
   //solve the sit number issue
   const accpting_schedule_id=for_schedule_accepting._id
   await Schedule.findByIdAndUpdate(accpting_schedule_id,
     {
     $set:{ passangerInfo:{$addToSet:{$each:add_passanger_info}},occupiedSitNo:[...final_transfer_sit,...occupied2]}
     },
     {session,new:true,useFindAndModify:false}
     )
   //make istransferd true
   await Schedule.findByIdAndUpdate(schedule_id,{
     $set:{
      isTransfered:true,
     }
   },{session,new:true,useFindAndModify:false})
   //find unique socket of organization that we want to send request notification
   const socket_id=req.body.scoketid
  await session.commitTransaction();
  io.getIo().emit({action:"RequestAccepted",value:"your request is accepted by Name of the company"})
  res.json("request sent successfully")
  }
  catch(error) {
    await session.abortTransaction();
    next(error)
  }
};
//transfer schedule request rejected
exports.rejectScheduleTransferRequest = async (req, res, next) => {
  try {
io.getIo().emit({action:"RequestRejected",value:"your request isnot accepted by Name of the company"})
 return 
  }
  catch(error) {
    next(error)
  }
}
//postpone trip for specific userinfo
exports.postPoneTrip = async (req, res, next) => {
  const session=await Schedule.startSession()
  try {
    const schedule_id=req.body.id
    const source=req.body.source
    const destination=req.body.destination
    const passange_name=req.body.passname
    const pass_phone_number=req.body.passphone
    const passanger_unique_id=req.body.passangerid
    const booked_by=req.body.bookedby
    const total_sit_arr=req.body.reservedsit
    const new_departure_date=req.body.newdeparturedate
    const orgcode=req.userinfo.organization_code
  
    const postpone_to=await Schedule.findOne({source:source,destination:destination,departureDateAndTime:new_departure_date,organizationCode:orgcode})
    const occup_sit=postpone_to.occupiedSitNo
    //sit not allowed
    const sit_not_allowed=total_sit_arr.filter((elem)=>{
      return occup_sit.includes(elem)
    })
    const generated_sit=[]
//sit allowed
    const sit_allowed=total_sit_arr.filter((elem)=>{
      return !occup_sit.includes(elem)
    })
    if(intersection.length>0)
    {
    for (let i=0;i<sit_not_allowed.length; i++)
    {
      let sit=sit_gene(1, 49)
      generated_sit.push(sit)
    }
  }
  const new_allowed_sit=sit_not_allowed.map((ele)=>{
     return generated_sit.splice(-1)[0]
  })
  const submit_sit=[...sit_allowed,...new_allowed_sit]
    //solve the sit issue
    session.startTransaction()
    await Schedule.findByIdAndUpdate(postpone_to._id,
      {
          $push:{passangerInfo:{passangerName:passange_name,
           passangerPhone:pass_phone_number,
           uniqueId:passanger_unique_id,
           PassangerOccupiedSitNo:submit_sit,
           bookedBy:booked_by}},
           $addToSet:{occupiedSitNo:{$each:submit_sit}},
           }
      ,{session,new:true})
      const change_preivious_schedule=await Schedule.findByIdAndUpdate(schedule_id,
        {$set:{"passangerInfo.$[el].isPassangerPostponed":true}},
        {arrayFilters:[{"el.uniqueId":passanger_unique_id}],session,new:true,useFindAndModify:false})
       session.commitTransaction()

 return res.json()
  }
  catch(error) {
    await session.abortTransaction();
    next(error)
  }
}
//refund
exports.refundRequest = async (req, res, next) => {
  const session=await Schedule.startSession()
  try {
    const schedule_id=req.params.id
    const pass_id=req.body.uniqueid
    const pass_sit=req.body.passsit//[]
    console.log(pass_sit,pass_id)
    session.startTransaction()
    const timenow = new Date
    const schedule=await Schedule.findById(schedule_id)
    if(moment(schedule.departureDateAndTime).isAfter(timenow))
    { 
      await Schedule.findByIdAndUpdate(schedule_id,{$set:{"passangerInfo.$[el].isTiacketCanceled":true},$addToSet:{sitCanceled:{$each:pass_sit}},$pull: { occupiedSitNo: { $in: pass_sit }}},
      {arrayFilters:[{"el.uniqueId":pass_id}],session,new:true,useFindAndModify:false})
      
    }
    else{
      console.log('ohh no')
      await Schedule.findByIdAndUpdate(schedule_id,{$set:{"passangerInfo.$[el].isTiacketCanceled":true,sitCanceled:1}},
      {arrayFilters:[{"el.uniqueId":pass_id}],session,new:true,useFindAndModify:false})
    }
    session.commitTransaction()
    return res.json("refund done")

  }
  catch(error) {
    await session.abortTransaction();
    next(error)
  }
}
