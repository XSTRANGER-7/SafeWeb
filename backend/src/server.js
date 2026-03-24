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
const debugRoutes = require('./routes/debugRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

app.use('/mock', mockRoutes);
app.use('/admin', adminRoutes);
app.use('/upload', uploadRoutes);
// Development-only debug endpoints (frontend posts OTP here)
app.use('/api/debug', debugRoutes);
app.use('/whatsapp', whatsappRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// health
app.get('/', (req, res) => res.send({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 5000;

// Start server and attach an error handler to avoid uncaught 'error' events
const server = app.listen(PORT, () => console.log(`Backend running on ${PORT}`));

// server.on('error', (err) => {
// 	if (err && err.code === 'EADDRINUSE') {
// 		console.error(`\nERROR: Port ${PORT} is already in use.`);
// 		console.error('Possible causes: another instance is running or the port is reserved.');
// 		console.error('On Windows you can run:');
// 		console.error('  netstat -ano | findstr :' + PORT);
// 		console.error('Then:');
// 		console.error('  taskkill /PID <pid> /F');
// 		// Exit with non-zero so process managers (nodemon) show that start failed clearly
// 		process.exit(1);
// 	}
// 	// Re-throw other errors so they surface
// 	throw err;
// });
