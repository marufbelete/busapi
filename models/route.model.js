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
selectedBusForRoute: [{
    type: Schema.Types.ObjectId, ref: 'user', 
    required: true,
}],
estimatedHour: {
    type: String,
    trim: true,
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

const Route = mongoose.model("route", RouteSchema);

module.exports = Route;