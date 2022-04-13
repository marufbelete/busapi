const express = require('express');
const userauth = require("../middleware/auth.middleware")
const {authOwner,authSuperAdmin,authAdmin,authaAdminCasher,authaAdminCasherAgent} = require("../middleware/authadmin.middleware")
const {getAllSchedule,getBusRouteHistory,getTripHistory,getPostponedPassangerList,getAllSaleAmountByUser,getAllScheduleWithSit,getScheduleByCriteria,getTransferdPassangerList,getAllCanceledSchedule,getAllActiveSchedule,getAllActiveScheduleInRoute,myBookedTicketList,myPassangerList}= require("../controllers/dashboard.controller")
const {errorHandler} = require('../middleware/errohandling.middleware')
const router = express.Router();
//schedule
// router.get('/getallschedule',userauth,authAdmin,getAllSchedule,errorHandler)
router.get('/getallactiveschedule',userauth,getAllActiveSchedule,errorHandler)
router.get('/getallcanceledschedule',userauth,getAllCanceledSchedule,errorHandler)
router.get('/getallactivescheduleinroute',userauth,getAllActiveScheduleInRoute,errorHandler)
router.get('/mybookedticket',userauth,myBookedTicketList,errorHandler)
router.get('/mypassanger',userauth,myPassangerList,errorHandler)
router.get('/postponedpassangers',userauth,getPostponedPassangerList,errorHandler)
router.get('/transferedpassangers',userauth,getTransferdPassangerList,errorHandler)


router.get('/getschedulebycriteria',userauth,getScheduleByCriteria,errorHandler)
router.get('/getallschedulewithsit',userauth,getAllScheduleWithSit,errorHandler)
router.get('/getallsalesgroup',userauth,getAllSaleAmountByUser,errorHandler)
router.get('/getallbusroutehistory',userauth,getBusRouteHistory,errorHandler)
router.get('/getalltriphistory',userauth,getTripHistory,errorHandler)

module.exports = router

