const Document = require("../models/Document");
const Reference = require("../models/Reference");
const AuditLog = require("../models/AuditLog");

// Create a new Document
const createDocument = async (req, res) => {
  try {
    const { filename, data, documentType, version_string, referenceId } =
      req.body;
    const version = Number(version_string);
    if (
      !filename ||
      !data ||
      !documentType ||
      typeof version !== "number" ||
      !referenceId
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const document = new Document({
      filename,
      data: Buffer.from(data, "base64"), // Assuming data is sent as base64 string
      documentType,
      version,
      reference: referenceId,
    });

    await document.save();

    // Add the document to the reference's documents array
    const reference = await Reference.findById(referenceId);
    reference.documents.push(document._id);
    await reference.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created document '${filename}' for reference '${reference.code}'`,
    });
    await auditLog.save();

    res
      .status(201)
      .json({ message: "Document created successfully", document });
  } catch (err) {
    console.error("Error creating document:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all Documents for a Reference
const getDocumentsByReferenceId = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const documents = await Document.find({ reference: referenceId }).select(
      "-data"
    );

    res.json({ documents });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a Document by ID
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "reference",
      "code project"
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Set projectId for access control
    if (!document.reference.project) {
      return res
        .status(400)
        .json({ error: "Reference is not associated with a project" });
    }
    req.params.projectId = document.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware("viewDocuments");
    await middleware(req, res, () => {
      res.json({ document });
    });
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a Document
const updateDocument = async (req, res) => {
  try {
    const { filename, data, documentType, version } = req.body;

    const document = await Document.findById(req.params.id).populate(
      "reference",
      "project"
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Set projectId for access control
    if (!document.reference.project) {
      return res
        .status(400)
        .json({ error: "Reference is not associated with a project" });
    }
    req.params.projectId = document.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware("manageDocuments");
    await middleware(req, res, async () => {
      // Update fields if provided
      if (filename) document.filename = filename;
      if (data) document.data = Buffer.from(data, "base64");
      if (documentType) document.documentType = documentType;
      if (typeof version === "number") document.version = version;

      await document.save();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Updated document '${document.filename}'`,
      });
      await auditLog.save();

      res.json({ message: "Document updated successfully", document });
    });
  } catch (err) {
    console.error("Error updating document:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a Document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "reference"
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Set projectId for access control
    if (!document.reference.project) {
      return res
        .status(400)
        .json({ error: "Reference is not associated with a project" });
    }
    req.params.projectId = document.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware("manageDocuments");
    await middleware(req, res, async () => {
      // Remove the document from the reference's documents array
      const reference = document.reference;
      reference.documents.pull(document._id);
      await reference.save();

      await document.deleteOne();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Deleted document '${document.filename}'`,
      });
      await auditLog.save();

      res.json({ message: "Document deleted successfully" });
    });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createDocument,
  getDocumentsByReferenceId,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
