const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const documentController = require("../controllers/documentController");
const multer = require("multer");
const upload = multer();
const cors = require("cors");

// Middleware to set projectId from referenceId
async function setProjectIdFromReference(req, res, next) {
  try {
    const referenceId =
      req.body.referenceId || req.params.referenceId || req.query.referenceId;
    if (!referenceId) {
      return res.status(400).json({ error: "referenceId is required" });
    }

    const reference = await Reference.findById(referenceId);
    if (!reference) {
      return res.status(404).json({ error: "Reference not found" });
    }

    if (!reference.project) {
      return res
        .status(400)
        .json({ error: "Reference is not associated with a project" });
    }

    req.params.projectId = reference.project.toString();
    next();
  } catch (err) {
    console.error("Error in setProjectIdFromReference:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Create a new Document
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  documentController.createDocument
);

// Get all Documents for a Reference
router.get(
  "/reference/:referenceId",
  authMiddleware,
  documentController.getDocumentsByReferenceId
);

// Get a Document by ID
router.get(
  "/:id",
  authMiddleware,
  cors({ exposedHeaders: ["Content-Disposition"] }),
  documentController.getDocumentById
);

// Update a Document
router.put("/:id", authMiddleware, documentController.updateDocument);

// Delete a Document
router.delete("/:id", authMiddleware, documentController.deleteDocument);

module.exports = router;
