const Schedule = require("../models/schedule.model");
const {milliSecond}=require("../reusable_logic/sit_generator")
//gorup schedule by sou and dest and filter bydate and return number of trip
exports.getScheduleByCriteria = async (req, res, next) => {
  try{
const orgcode =req.userinfo.organization_code;
const today=new Date()
let matc={organizationCode:orgcode,departureDateAndTime:{$lte:today}};

//like start ?startdate=2022-4-12
if(req.query.startdate)
{
  let date=new Date(req.query.startdate)
  console.log(req.query.startdate)
  const matcone={departureDateAndTime:{$gte:date}}
  matc={...matcone}
}
if(req.query.enddate)
{
  let date=new Date(req.query.enddate)
  console.log(date)
  const matcone={departureDateAndTime:{$lte:date}}
  matc={...matcone}
}
  const allSchedule= await Schedule.aggregate( [
    {
       $match:matc
    },
    {
       $group: { _id: {"source":"$source","destination":"$destination"},"total": {$sum: 1 }}
    },
    {
      $project:{"_id":0,"source":"$_id.source","destination":"$_id.destination","total":"$total"}
    },
   
    
  ] )
  return res.json(allSchedule)
}
catch(error) {
  next(error)
  }
};

//booked sit of each trip return sour,dest,totalsir,reservedsit
exports.getAllScheduleWithSit = async (req, res, next) => {
  try{
  const today=new Date()
  const orgcode =req.userinfo.organization_code;
  const allSchedule= await Schedule.aggregate( [
    {
       $match:{organizationCode:orgcode,departureDateAndTime:{$lte:today}}
    },
     {
      $project:{"source":"$source","destination":"$destination","totalSit":"$totalNoOfSit","totalReservedSit":{$size:"$occupiedSitNo"}}
    },
    {
      $sort:{"totalReservedSit":-1}
    }
  ] )
  return res.json(allSchedule)
}
catch(error) {
  next(error)
  }
};

//get all my sale
exports.getAllSaleAmountByUser = async (req, res, next) => {
  try{
  const today=new Date()
  const orgcode =req.userinfo.organization_code;
  const allSchedule= await Schedule.aggregate( [
    {
       $match:{organizationCode:orgcode,departureDateAndTime:{$lte:today}}
    },
    {
      $unwind:"$passangerInfo"
    },
    {
    $match:{"user.isMobileUser":false}
    },
  {
  $group:{_id:{"bookedBy":"$passangerInfo.bookedBy","source":"$source","destination":"$destination"},"total":{$sum:1}}
  },
  {
    $lookup:{
     from:'users',
     foreignField:"_id",
     localField:"_id.bookedBy",
     as:"user"
   }
 },
{
  $project:{"_id":0,"source":"$_id.source","destination":"$_id.destination","total":1,"salesFirstName":{$arrayElemAt:["$user.firstName",0]},"salesLastName":{$arrayElemAt:["$user.lastName",0]},"salesRole":{$arrayElemAt:["$user.userRole",0]},"salesPhone":{$arrayElemAt:["$user.phoneNumber",0]}}
},
{
  $sort:{
    "total":-1
  }
},
  ] )
  return res.json(allSchedule)
}
catch(error) {
  next(error)
  }
};

//get trip history
exports.getTripHistory = async (req, res, next) => {
  try{
  const today=new Date()
  const orgcode =req.userinfo.organization_code;
  const allSchedule= await Schedule.aggregate( [
  {
      $match:{organizationCode:orgcode,departureDateAndTime:{$lte:today}}
  },
    {
  $group:{
  _id:{"source":"$source","destination":"$destination"},"count":{$sum:1}
}
},
{
 $project:{"_id":0,"source":"$_id.source","destination":"$_id.destination","total":"$count"}
},
{
  $sort:{
    "total":-1
  }
}
  ] )
  return res.json(allSchedule)
}
catch(error) {
  next(error)
  }
};
//bus history
exports.getBusRouteHistory = async (req, res, next) => {
  try{
  const today=new Date()
  const orgcode =req.userinfo.organization_code;
  const allSchedule= await Schedule.aggregate( [
  {
      $match:{organizationCode:orgcode,departureDateAndTime:{$lte:today}}
  },
    {
 $group:{
  _id:{"busid":"$assignedBus","source":"$source","destination":"$destination"},"count":{$sum:1}}
    },
    {
    $lookup:{
     from:'buses',
     foreignField:"_id",
     localField:"_id.busid",
     as:"businfo"
      }
    },
     {
      $project:{"_id":0,"source":"$_id.source","destination":"$_id.destination","total":"$count","busplate":{$arrayElemAt:["$businfo.busPlateNo",0]},"busSideno":{$arrayElemAt:["$businfo.busSideNo",0]},"serviceyear":{$arrayElemAt:["$businfo.serviceYear",0]},"currentbusstate":{$arrayElemAt:["$businfo.busState",0]}}
    },
  ] )
  return res.json(allSchedule)
}
catch(error) {
  next(error)
  }
};
//saled ticket by mobile
//saled in birr by mobile
//total sale in birr by person
//total sale of all person in birr
//total ticket of all user and route
//totl ticket in given route all user
//cancled by so and dest
//cancled ticket all
//transd...

//all schedules for that casher or agent
exports.getAllMySale = async (req, res, next) => {
  try {
    let page = !!req.query.pageno ? req.query.pageno : 0
    let pagesize = 20
    let skip = pagesize * page
  const orgcode =req.userinfo.organization_code;
  const saler_id =req.userinfo.sub;
  const role_type=req.userinfo.user_role;
  const allSchedule= await Schedule.find({organizationCode:orgcode,userRole:role_type,"passangerInfo.bookedBy":saler_id}).limit(pagesize).skip(skip).sort({datefield:-1})
  const all_my_sale=allSchedule.map(eachdoc=> 
    {
      return {source:eachdoc.source,destination:eachdoc.destination,tarif:eachdoc.tarif,departureDate:eachdoc.departureDate,departurePlace:eachdoc.departurePlace,passInfo:y.passInfo.filter(filterpassanger=>{return filterpassanger.bookedby===role_type})}})
  return res.json(all_my_sale)
  }
  catch(error) {
  next(error)
  }
};

//between dates
exports.getAllMySaleBetween = async (req, res, next) => {
  try {
    const start = req.params.start
    const end=!!req.params.end ? req.params.end : ''
    let skip = pagesize * page
  const orgcode =req.userinfo.organization_code;
  const saler_id =req.userinfo.sub;
  const role_type=req.userinfo.user_role;
  const allSchedule= await Schedule.find({organizationCode:orgcode,userRole:role_type,"passangerInfo.bookedBy":saler_id})
  const all_my_sale=allSchedule.map(eachdoc=> 
    {
      return {source:eachdoc.source,destination:eachdoc.destination,tarif:eachdoc.tarif,departureDate:eachdoc.departureDate,departurePlace:eachdoc.departurePlace,passInfo:y.passInfo.filter(filterpassanger=>{return filterpassanger.bookedby===role_type})}})
  return res.json(all_my_sale)
  }
  catch(error) {
  next(error)
  }
};
//get calceled route
exports.getAllCanceledSchedule = async (req, res, next) => {
  try {
    let page = !!req.query.pageno ? req.query.pageno : 0
    let pagesize = 20
    let skip = pagesize * page
  const orgcode =req.userinfo.organization_code;
  const allCanceledSchedule= await Schedule.find({organizationCode:orgcode,isCanceled:true}).limit(pagesize).skip(skip).sort({datefield:-1})
  return res.json(allCanceledSchedule)
  }
  catch(error) {
  next(error)
  }
};
//get all active schedule
exports.getAllActiveSchedule = async (req, res, next) => {
  try {
    
  const orgcode =req.params.organizationcode;
  const timenow=Date.now();
  const allSchedule= await Schedule.find({organizationCode:orgcode,isCanceled:false,departureTDateAndTime:{$gte:timenow}}).limit(pagesize).skip(skip).sort({datefield:-1})
  return res.json(allSchedule)
  }
  catch(error) {
  next(error)
  }
};
//compare time and show only future schedule dep.date
exports.getAllActiveScheduleInRoute = async (req, res, next) => {
  try {
  const orgcode =req.params.organizationcode;
  const timenow=Date.now();
  const source=req.query.source;
  const destination=req.query.destination;
  const allSchedule= await Schedule.find({organizationCode:orgcode,source:source,destination:destination,isCanceled:false,departureDate:{$gte:timenow}})
  return res.json(allSchedule)
  }
  catch(error) {
  next(error)
  }
};
//for mobile userinfo only
exports.getAllActiveScheduleInRouteForMobileUser = async (req, res, next) => {
  try {
    let page = !!req.query.pageno ? req.query.pageno : 0
    let pagesize = 12
    let skip = pagesize * page

    const source=req.query.source;
    const destination=req.query.destination;
    const orgcode =req.query.organizationcode;
    if(!!source && !!destination)
    {
      const error=new Error("please fill all required field")
      error.statusCode=400
      throw error
    }
    const conditions=[]
    if (orgcode.toLowerCase()!=="all") {
      conditions.push({ organizationCode:orgcode});
  }
  const timenow=Date.now();
  conditions.push({source:source,destination:destination,isCanceled:false,departureDate:{$gte:timenow}})
  const final_condtion={$and:conditions}
 
  const allSchedule= await Schedule.find(final_condtion).limit(pagesize).skip(skip).sort({datefield:-1})
  return res.json(allSchedule)
  }
  catch(error) {
  next(error)
  }
};

//My booking
exports.myBookedTicketList = async (req, res, next) => {
  try {
  //selecte the field in all api
  let page = !!req.query.pageno ? req.query.pageno : 0
  let pagesize = 10
  let skip = pagesize * page

   const id=req.params.id
   const user_id=req.userinfo.sub
   const my_booking=await Schedule.find({"passangerInfo.bookedBy":user_id}).limit(pagesize).skip(skip).sort({datefield:-1})
   res.json(my_booking)
  }
  catch(error) {
    next(error)
  }
};
//My passanger for driver
// can be accessed by driver
exports.myPassangerList = async (req, res, next) => {
  try {
  //selecte the field in all api
  // for departure date lethan now
   const username=req.userinfo.phone_number;
   const addHour=2;
   const addMilisecond=milliSecond(addHour);
   const timenow = Date.now()+addMilisecond
   const my_booking=await Schedule.findOne({driverUserName:username,departureDate:{$lte:timenow}}).sort({datefield:-1})
   res.json(my_booking)
  }
  catch(error) {
    next(error)
  }
};
// get postponed passanger
exports.getPostponedPassangerList= async (req, res, next) => {
  try {
   const pass=await Schedule.find({isPassangerPostponed:true}).sort({datefield:-1})
   res.json(pass)
  }
  catch(error) {
    next(error)
  }
};
// get postponed passanger
exports.getTransferdPassangerList= async (req, res, next) => {
  try {
   const pass=await Schedule.find({isPassangerTransfered:true}).sort({datefield:-1})
   res.json(pass)
  }
  catch(error) {
    next(error)
  }
};
