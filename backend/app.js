require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Import routes
const userRoutes = require("./routes/usersRoutes");
const auditLogRoutes = require("./routes/auditLogsRoutes");
const projectRoutes = require("./routes/projectRoutes");
const roleRoutes = require("./routes/roleRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const workflowStepRoutes = require("./routes/workflowStepRoutes");
const documentRoutes = require("./routes/documentRoutes");
const cadFileRoutes = require("./routes/cadFileRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const specificationRoutes = require("./routes/specificationRoutes");
const bomRoutes = require("./routes/bomRoutes");
const bomResourceRoutes = require("./routes/bomResourceRoutes");
const customerNeedsRoutes = require("./routes/customerNeedsRoutes");
const manufacturingProcessRoutes = require("./routes/manufacturingProcessRoutes");
const processResourceRoutes = require("./routes/processResourceRoutes");
const productRoutes = require("./routes/productRoutes");
const referenceRoutes = require("./routes/referenceRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/workflow-steps", workflowStepRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/cad-files", cadFileRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/specifications", specificationRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/bom-resources", bomResourceRoutes);
app.use("/api/customer-needs", customerNeedsRoutes);
app.use("/api/manufacturing-processes", manufacturingProcessRoutes);
app.use("/api/process-resources", processResourceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/references", referenceRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/tasks", taskRoutes);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/plm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
