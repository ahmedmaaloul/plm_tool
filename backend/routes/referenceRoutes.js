const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const referenceController = require('../controllers/referenceController');
const setProjectIdFromReference = require('../middleware/setProjectIdFromReferenceMiddleware')

// Create a new Reference
router.post('/', authMiddleware, roleMiddleware('createReference'), referenceController.createReference);

// Get all References (with optional filtering)
router.get('/', authMiddleware, referenceController.getReferences);

// Get a Reference by ID
router.get('/:id', authMiddleware, referenceController.getReferenceById);

// Update a Reference
router.put('/:id', authMiddleware,setProjectIdFromReference, roleMiddleware('updateReference'), referenceController.updateReference);

// Delete a Reference
router.delete('/:id', authMiddleware,setProjectIdFromReference, roleMiddleware('deleteReference'), referenceController.deleteReference);

module.exports = router;
