const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const roleController = require('../controllers/roleController');

// Assign a role to a user
router.post('/assign', authMiddleware, roleController.assignRole);

// Remove a role from a user
router.delete('/remove', authMiddleware, roleController.removeRole);

// Get all roles for a project
router.get('/project/:projectId', authMiddleware, roleMiddleware('viewProjectRoles'), roleController.getProjectRoles);

// Get all roles for a user in a project
router.get('/project/:projectId/user/:userId', authMiddleware, roleMiddleware('viewProjectRoles'), roleController.getUserRolesInProject);

module.exports = router;
