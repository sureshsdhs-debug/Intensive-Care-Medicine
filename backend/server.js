// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToMongo = require('./db/mongoDb');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";


// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded files in /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const courseRoutes = require('./routes/courseRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const tableOfContentsRoutes = require('./routes/tableOfContentsRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/table-of-contents', tableOfContentsRoutes);

// 404 and error handlers...
app.use((req, res, next) => res.status(404).json({ message: 'Not Found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

(async () => {
  try {
    await connectToMongo();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  }
})();
