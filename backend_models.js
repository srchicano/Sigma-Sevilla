
// backend_models.js
// COPY THIS FILE TO YOUR RENDER BACKEND REPO

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: String,
  matricula: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  role: { type: String, enum: ['ADMIN', 'SUPERVISOR', 'AGENTE'], default: 'AGENTE' },
  isApproved: { type: Boolean, default: false }
});

const AgentSchema = new mongoose.Schema({
  id: String,
  name: String,
  assignedSectorId: String
});

const ElementSchema = new mongoose.Schema({
  id: String,
  stationId: String,
  installationType: String,
  name: String,
  isCompleted: Boolean,
  lastMaintenanceDate: String,
  data: Object
});

const MaintenanceSchema = new mongoose.Schema({
  id: String,
  elementId: String,
  date: String,
  turn: String,
  agents: [String],
  dataSnapshot: Object
});

const FaultSchema = new mongoose.Schema({
  id: String,
  elementId: String,
  date: String,
  stationName: String,
  agents: [String],
  description: String,
  times: Object,
  causes: String,
  repair: String
});

const MonthlyListSchema = new mongoose.Schema({
  id: String,
  month: Number,
  year: Number,
  items: [{
      elementId: String,
      stationName: String,
      installationType: String,
      elementName: String,
      completed: Boolean
  }]
});

const RosterSchema = new mongoose.Schema({
    id: String,
    sectorId: String,
    month: Number,
    year: Number,
    data: Object
});

export const User = mongoose.model('User', UserSchema);
export const Agent = mongoose.model('Agent', AgentSchema);
export const Element = mongoose.model('Element', ElementSchema);
export const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);
export const Fault = mongoose.model('Fault', FaultSchema);
export const MonthlyList = mongoose.model('MonthlyList', MonthlyListSchema);
export const Roster = mongoose.model('Roster', RosterSchema);
