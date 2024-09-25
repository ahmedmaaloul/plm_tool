// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const userRoutes = require('./routes/usersRoutes');
const accessControlRoutes = require('./routes/accessControlRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const projectRoutes = require('./routes/projectRoutes');
const roleRoutes = require('./routes/roleRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const workflowStepRoutes = require('./routes/workflowStepRoutes');
// ... import other routes as needed

// Middleware
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/access-controls', accessControlRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/workflow-steps', workflowStepRoutes);

// ... use other routes

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
