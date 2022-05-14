const Bus = require("../models/bus.model");

exports.registerBus = async (req, res, next) => {
  try {
    const busplateno = req.body.busplateno;
    const bussideno= req.body.bussideno;
    const bus_state=req.body.bus_state;
    const redat_id =req.body.redatid;
    const driver_id =req.body.driverid;
    const service_year=req.body.serviceyear;
    const totalsit =req.body.totalsit;
    const createdby =req.userinfo.sub;
    const orgcode =req.userinfo.organization_code;
if(!!busplateno && !!bussideno && !!driverusername && !!totalsit)
{ 
    const newbus= new Bus({
      busPlateNo:busplateno ,
      busSideNo:bussideno,
      driverId:driver_id,
      readtId:redat_id,
      serviceYear:service_year,
      totalNoOfSit:totalsit,
      createdBy:createdby,
      organizationCode:orgcode,
      busState:bus_state
    })
    const savedbus=await newbus.save()
    return res.json(savedbus)
  }
  const error = new Error("please fill all field")
  error.statusCode = 400
  throw error;
  }
catch(error) {
next(error);
  }
};
//get all organizaton bus organization
exports.getAllOrganizationBus = async (req, res, next) => {
  try {
    console.log(req.userinfo)
  const orgcode =req.userinfo.organization_code;
  console.log(orgcode)
  const allbus= await Bus.find({organizationCode:orgcode})
  res.json(allbus)
  }
  catch(error) {
    next(error)
  }
};
//only active bus this is for assigning bus to some schedule
exports.getAllOrganizationActiveBus = async (req, res, next) => {
  try {
  const orgcode =req.userinfo.organization_code;
  const allbus= await Bus.find({organizationCode:orgcode,busState:"Active"})
  res.json(allbus)
  }
  catch(error) {
    next(error)
  }
};
exports.getAllOrganizationInactiveBus = async (req, res, next) => {
  try {
  const orgcode =req.userinfo.organization_code;
  const allbus= await Bus.find({organizationCode:orgcode,busState:"Inactive"})
  res.json(allbus)
  }
  catch(error) {
    next(error)
  }
};
exports.getAllOrganizationOnRepairBus = async (req, res, next) => {
  try {
  const orgcode =req.userinfo.organization_code;
  const allbus= await Bus.find({organizationCode:orgcode,busState:"On-Repair"})
  res.json(allbus)
  }
  catch(error) {
    next(error)
  }
};
exports.getAllOrganizationDamagedBus = async (req, res, next) => {
  try {
  const orgcode =req.userinfo.organization_code;
  const allbus= await Bus.find({organizationCode:orgcode,busState:"Damaged"})
  res.json(allbus)
  }
  catch(error) {
    next(error)
  }
};

//get organization by id
exports.updateBusInfo = async (req, res, next) => {
  try {
   const id=req.params.id
   const busplateno = req.body.busplateno;
   const bussideno= req.body.bussideno;
   const driver_id =req.body.driverid;
   const redat_id =req.body.redatid;
   const bus_state=req.body.bus_state;
   const totalsit =req.body.totalsit;
   const createdby =req.userinfo.sub;
   const bus= await Bus.findAndUpdateById(id,{
     $set:{
      busPlateNo:busplateno ,
      busSideNo:bussideno,
      driverId:driver_id,
      readtId:redat_id,
      totalNoOfSit:totalsit,
      createdBy:createdby,
      busState:bus_state
     }
   })
   res.json(bus)
  }
  catch(error) {
    next(error)
  }
};
//change bus status
exports.updateBusStatus = async (req, res, next) => {
  try {
   const id=req.params.id
   const bus_status = req.body.busstatus;
   const bus= await Bus.findAndUpdateById(id,{
     $set:{
      busState:bus_status
     }
   })
   res.json(bus)
  }
  catch(error) {
    next(error)
  }
};
//delete role
exports.deleteBus = async (req, res, next) => {
  try {
   const deleteid=req.params.id
   await Bus.findByIdAndDelete(deleteid)
   res.json("deleted successfully")
  }
  catch(error) {
    next(error)
  }
};
