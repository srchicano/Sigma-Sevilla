
// backend_server.js
// COPY THIS FILE TO YOUR RENDER BACKEND REPO as index.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import models with .js extension required for ES Modules
import { User, Agent, Element, Maintenance, Fault, MonthlyList, Roster } from './backend_models.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT DB
// Ensure MONGODB_URI is set in Render Environment Variables
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Error: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// --- ROUTES ---

// USERS
app.post('/api/users/login', async (req, res) => {
    const { matricula, password } = req.body;
    const user = await User.findOne({ matricula, password, isApproved: true });
    if(user) res.json(user);
    else res.status(401).send('Unauthorized');
});

app.post('/api/users/register', async (req, res) => {
    const newUser = new User({ ...req.body, id: Date.now().toString() });
    await newUser.save();
    res.json(newUser);
});

app.get('/api/users/pending', async (req, res) => {
    const users = await User.find({ isApproved: false });
    res.json(users);
});

app.post('/api/users/:id/approve', async (req, res) => {
    const { approve } = req.body;
    if(approve) {
        await User.findOneAndUpdate({ id: req.params.id }, { isApproved: true });
    } else {
        await User.findOneAndDelete({ id: req.params.id });
    }
    res.json({ success: true });
});

app.get('/api/users', async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

app.delete('/api/users/:id', async (req, res) => {
    await User.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

app.patch('/api/users/:id/role', async (req, res) => {
    await User.findOneAndUpdate({ id: req.params.id }, { role: req.body.role });
    res.json({ success: true });
});

// AGENTS
app.get('/api/agents', async (req, res) => {
    const agents = await Agent.find({});
    res.json(agents);
});

app.post('/api/agents', async (req, res) => {
    const agent = new Agent({ ...req.body, id: Date.now().toString(), assignedSectorId: null });
    await agent.save();
    res.json(agent);
});

app.patch('/api/agents/:id/sector', async (req, res) => {
    await Agent.findOneAndUpdate({ id: req.params.id }, { assignedSectorId: req.body.sectorId });
    res.json({ success: true });
});

app.delete('/api/agents/:id', async (req, res) => {
    await Agent.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

// ELEMENTS
app.get('/api/elements', async (req, res) => {
    const { stationId, type } = req.query;
    if(stationId && type) {
        const els = await Element.find({ stationId, installationType: type });
        res.json(els);
    } else {
        // Fallback for search
        const els = await Element.find(stationId ? { stationId } : {});
        res.json(els);
    }
});

app.get('/api/elements/counts', async (req, res) => {
    const { stationId } = req.query;
    const elements = await Element.find({ stationId });
    const counts = {};
    elements.forEach(e => {
        counts[e.installationType] = (counts[e.installationType] || 0) + 1;
    });
    res.json(counts);
});

app.post('/api/elements', async (req, res) => {
    const el = new Element(req.body);
    await el.save();
    res.json(el);
});

app.put('/api/elements/:id', async (req, res) => {
    await Element.findOneAndUpdate({ id: req.params.id }, req.body);
    res.json({ success: true });
});

// MAINTENANCE
app.post('/api/maintenance', async (req, res) => {
    const record = new Maintenance(req.body);
    await record.save();
    // Update Element Last Date
    await Element.findOneAndUpdate({ id: req.body.elementId }, { lastMaintenanceDate: req.body.date });
    res.json(record);
});

app.get('/api/maintenance', async (req, res) => {
    const { elementId } = req.query;
    const records = await Maintenance.find({ elementId }).sort({ id: -1 }); 
    res.json(records);
});

app.delete('/api/maintenance/:id', async (req, res) => {
    await Maintenance.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

// FAULTS
app.post('/api/faults', async (req, res) => {
    const record = new Fault(req.body);
    await record.save();
    res.json(record);
});

app.get('/api/faults', async (req, res) => {
    const { elementId } = req.query;
    const records = await Fault.find({ elementId }).sort({ id: -1 });
    res.json(records);
});

app.delete('/api/faults/:id', async (req, res) => {
    await Fault.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

// REPORTS & LISTS
app.get('/api/reports/daily', async (req, res) => {
    const { date, turn } = req.query;
    const query = { date };
    if(turn) query.turn = turn;
    
    const records = await Maintenance.find(query);
    // Join with elements for name
    const results = await Promise.all(records.map(async r => {
        const el = await Element.findOne({ id: r.elementId });
        return { ...r.toObject(), elementName: el?.name, stationId: el?.stationId };
    }));
    res.json(results);
});

app.get('/api/reports/monthly', async (req, res) => {
    const { month, year } = req.query;
    const records = await Maintenance.find({}); 
    const filtered = [];
    for(let r of records) {
         let d = new Date(r.date);
           if (isNaN(d.getTime())) {
                const parts = r.date.split('/');
                if(parts.length === 3) d = new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0]));
           }
           if (d.getMonth() + 1 == month && d.getFullYear() == year) {
               const el = await Element.findOne({ id: r.elementId });
               filtered.push({ ...r.toObject(), elementName: el?.name, stationId: el?.stationId });
           }
    }
    res.json(filtered);
});

app.post('/api/lists', async (req, res) => {
    await MonthlyList.findOneAndDelete({ month: req.body.month, year: req.body.year });
    const list = new MonthlyList(req.body);
    await list.save();
    res.json(list);
});

app.get('/api/lists', async (req, res) => {
    const { month, year } = req.query;
    const list = await MonthlyList.findOne({ month, year });
    if(list) {
         // Hydrate status
         const items = await Promise.all(list.items.map(async item => {
             const el = await Element.findOne({ id: item.elementId });
             return { ...item.toObject(), completed: el ? el.isCompleted : item.completed };
         }));
         const result = list.toObject();
         result.items = items;
         res.json(result);
    } else {
        res.json(null);
    }
});

app.get('/api/stats', async (req, res) => {
    const { semester, year } = req.query;
    const startMonth = semester == 1 ? 1 : 7;
    const endMonth = semester == 1 ? 6 : 12;

    const lists = await MonthlyList.find({ year, month: { $gte: startMonth, $lte: endMonth } });
    const stats = {};

    for (const list of lists) {
        for (const item of list.items) {
             if(!stats[item.installationType]) stats[item.installationType] = { total: 0, completed: 0 };
             stats[item.installationType].total++;
             const el = await Element.findOne({ id: item.elementId });
             if(el && el.isCompleted) stats[item.installationType].completed++;
        }
    }
    res.json(stats);
});

// ROSTER
app.get('/api/roster', async (req, res) => {
    const { sectorId, month, year } = req.query;
    const roster = await Roster.findOne({ sectorId, month, year });
    res.json(roster);
});

app.post('/api/roster', async (req, res) => {
    const { sectorId, month, year, data } = req.body;
    // Update or Insert
    const roster = await Roster.findOneAndUpdate(
        { sectorId, month, year },
        { data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(roster);
});

app.get('/api/roster/stats', async (req, res) => {
    const { sectorId, year } = req.query;
    const rosters = await Roster.find({ sectorId, year });
    // Aggregate data
    const stats = {};
    for (const r of rosters) {
        for (const agentId in r.data) {
            if (!stats[agentId]) stats[agentId] = {};
            for (const day in r.data[agentId]) {
                const type = r.data[agentId][day];
                if (type) stats[agentId][type] = (stats[agentId][type] || 0) + 1;
            }
        }
    }
    res.json(stats);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));