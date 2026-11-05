const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = Number(process.env.PORT || 3030);
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false }));

const Reviews = require('./review');
const Dealerships = require('./dealership');
const dataDir = path.join(__dirname, 'data');
const readSeed = (name, key) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'))[key] || [];

app.get('/', (_req, res) => res.send('Welcome to the dealership data API'));

app.get('/fetchReviews', async (_req, res) => {
  try { res.json(await Reviews.find().lean()); }
  catch (error) { console.error(error); res.status(503).json({ error: 'Review data is unavailable' }); }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try { res.json(await Reviews.find({ dealership: Number(req.params.id) }).lean()); }
  catch (error) { console.error(error); res.status(503).json({ error: 'Review data is unavailable' }); }
});

app.get('/fetchDealers', async (_req, res) => {
  try { res.json(await Dealerships.find().sort({ id: 1 }).lean()); }
  catch (error) { console.error(error); res.status(503).json({ error: 'Dealership data is unavailable' }); }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const query = state.toLowerCase() === 'all' ? {} : { state: new RegExp(`^${state}$`, 'i') };
    res.json(await Dealerships.find(query).sort({ id: 1 }).lean());
  } catch (error) { console.error(error); res.status(503).json({ error: 'Dealership data is unavailable' }); }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealerships.findOne({ id: Number(req.params.id) }).lean();
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    res.json([dealer]);
  } catch (error) { console.error(error); res.status(503).json({ error: 'Dealership data is unavailable' }); }
});

app.post('/insert_review', async (req, res) => {
  const required = ['name', 'dealership', 'review', 'purchase_date', 'car_make', 'car_model', 'car_year'];
  if (required.some((key) => req.body[key] === undefined || req.body[key] === '')) {
    return res.status(400).json({ error: 'All review fields are required' });
  }
  try {
    const latest = await Reviews.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
    const review = await Reviews.create({
      ...req.body,
      id: (latest?.id || 0) + 1,
      dealership: Number(req.body.dealership),
      car_year: Number(req.body.car_year),
      purchase: Boolean(req.body.purchase),
    });
    res.status(201).json(review.toObject());
  } catch (error) { console.error(error); res.status(500).json({ error: 'Error inserting review' }); }
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://mongo_db:27017/', { dbName: 'dealershipsDB', serverSelectionTimeoutMS: 15000 });
    if (await Reviews.estimatedDocumentCount() === 0) {
      await Reviews.insertMany(readSeed('reviews.json', 'reviews'));
    }
    if (await Dealerships.estimatedDocumentCount() === 0) {
      await Dealerships.insertMany(readSeed('dealerships.json', 'dealerships'));
    }
    app.listen(port, '0.0.0.0', () => console.log(`Dealership data API running on port ${port}`));
  } catch (error) {
    console.error('Could not connect to MongoDB or seed the dealership data.', error.message);
    process.exit(1);
  }
}

start();
