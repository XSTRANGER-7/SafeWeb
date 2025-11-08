// backend/src/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const initFirebaseAdmin = require('./firebaseAdmin');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased for file uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Initialize firebase admin once
initFirebaseAdmin();

// routes
const mockRoutes = require('./routes/mockRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/mock', mockRoutes);
app.use('/admin', adminRoutes);
app.use('/upload', uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// health
app.get('/', (req, res) => res.send({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
