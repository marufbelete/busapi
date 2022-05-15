const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
source: {
    type: String,
    trim: true,
    required: true,
  },
destination: {
    type: String,
    trim: true,
    required: true,
},
tarif: {
    type: String,
    trim: true,
    required: true,
},
distance:{
  type:Number,
  trim:true,
},
estimatedHour: {
    type: String,
    trim: true,
},
departurePlace: {
  type: [String],
  trim: true,
},
maximumTrip: {
  type: Number,
  trim: true,
},
bus: {
  type: [mongoose.Schema.Types.ObjectId],
  ref:'bus',
  required:true
},
createdBy:{
  type: mongoose.Schema.Types.ObjectId,  
  ref: 'user', 
  required: true,
},
organizationCode:{
    type: String,
    trim: true,
    required: true,
  }
},
  {
    timestamps: true,
  },
);

RouteSchema.index( { "source": 1, "destination": 1 }, { unique: true } )

const Route = mongoose.model("route", RouteSchema);

module.exports = Route;