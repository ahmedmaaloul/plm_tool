// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleController = require('../controllers/roleController');

// Assign a role to a user
router.post('/assign', authMiddleware, roleController.assignRole);

// Remove a role from a user
router.delete('/remove', authMiddleware, roleController.removeRole);

// Get all roles for a project
router.get('/project/:projectId', authMiddleware, roleController.getProjectRoles);

// Get all roles for a user in a project
router.get('/project/:projectId/user/:userId', authMiddleware, roleController.getUserRolesInProject);

// Create a new role for a project
router.post('/project/:projectId', authMiddleware, roleController.createRole);


router.get('/user/:userId', authMiddleware, roleController.getUserRoles);

module.exports = router;
