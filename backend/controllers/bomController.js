const BOM = require("../models/BOM");
const BOMResource = require("../models/BOMResource");
const ManufacturingProcess = require("../models/ManufacturingProcess");
const ProcessResource = require("../models/ProcessResource");
const Reference = require("../models/Reference");
const AuditLog = require("../models/AuditLog");

// Create a new BOM
const createBOM = async (req, res) => {
  try {
    const { name, referenceId } = req.body;

    if (!name || !referenceId) {
      return res
        .status(400)
        .json({ error: "Name and referenceId are required" });
    }

    const reference = await Reference.findById(referenceId);
    if (!reference) {
      return res.status(404).json({ error: "Reference not found" });
    }

    const bom = new BOM({ name, reference: referenceId });
    await bom.save();

    reference.bom = bom._id;
    await reference.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: "BOM created successfully", bom });
  } catch (err) {
    console.error("Error creating BOM:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getBOMs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, reference, project } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive search by name
    }

    if (reference) {
      query["reference.code"] = { $regex: reference, $options: "i" }; // Filter by reference code
    }

    if (project) {
      const references = await Reference.find({ project });
      query.reference = { $in: references.map((ref) => ref._id) }; // Filter by project ID
    }

    const totalBOMs = await BOM.countDocuments(query);
    const totalPages = Math.ceil(totalBOMs / limit);
    const boms = await BOM.find(query)
      .populate("reference", "code description")
      .populate("manufacturingProcesses")
      .populate("bomResources")
      .populate("specifications")
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      boms,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching BOMs:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a BOM by ID
const getBOMById = async (req, res) => {
  try {
    const { id } = req.params;
    const bom = await BOM.findById(id)
      .populate("reference", "code description")
      .populate({
        path: "manufacturingProcesses",
        populate: {
          path: "resource",
        },
      })
      .populate({
        path: "bomResources",
        populate: { path: "resource" },
      })
      .populate("specifications");

    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }

    res.json({ bom });
  } catch (err) {
    console.error("Error fetching BOM:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a BOM
const updateBOM = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, referenceId } = req.body;
    console.log(name)

    const bom = await BOM.findById(id);
    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }

    if (name) bom.name = name;

    if (referenceId && referenceId !== bom.reference.toString()) {
      const newReference = await Reference.findById(referenceId);
      if (!newReference) {
        return res.status(404).json({ error: "New reference not found" });
      }

      if (bom.reference) {
        const oldReference = await Reference.findById(bom.reference);
        if (oldReference) {
          oldReference.bom = null;
          await oldReference.save();
        }
      }

      newReference.bom = bom._id;
      await newReference.save();
      bom.reference = referenceId;
    }

    await bom.save();
    await bom.calculateTotals();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.json({ message: "BOM updated successfully", bom });
  } catch (err) {
    console.error("Error updating BOM:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a BOM
const deleteBOM = async (req, res) => {
  try {
    const { id } = req.params;

    const bom = await BOM.findById(id);
    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }

    // Remove BOM reference from associated Reference document
    if (bom.reference) {
      const reference = await Reference.findById(bom.reference);
      if (reference) {
        reference.bom = null;
        await reference.save();
      }
    }

    // Delete associated ManufacturingProcesses and their ProcessResources
    const manufacturingProcesses = await ManufacturingProcess.find({
      bom: bom._id,
    });
    for (const process of manufacturingProcesses) {
      // Delete ProcessResources associated with the ManufacturingProcess
      await ProcessResource.deleteMany({ manufacturingProcess: process._id });
      // Delete the ManufacturingProcess
      await process.deleteOne();
    }

    // Delete BOMResources associated with the BOM
    await BOMResource.deleteMany({ bom: bom._id });

    // Delete the BOM
    await bom.deleteOne();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.json({ message: "BOM and associated data deleted successfully" });
  } catch (err) {
    console.error("Error deleting BOM:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Recalculate totals for a BOM
const recalculateBOMTotals = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }

    await bom.calculateTotals();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Recalculated totals for BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.json({
      message: "BOM totals recalculated",
      totalCost: bom.totalCost,
      totalTime: bom.totalTime,
    });
  } catch (err) {
    console.error("Error recalculating BOM totals:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createBOM,
  getBOMs,
  getBOMById,
  updateBOM,
  deleteBOM,
  recalculateBOMTotals,
};
