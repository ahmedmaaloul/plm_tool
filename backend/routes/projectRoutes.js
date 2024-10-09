// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const projectController = require('../controllers/projectController');

// Create a new project
router.post('/', authMiddleware, adminMiddleware, projectController.createProject);

// Get all projects for the authenticated user
router.get('/', authMiddleware, projectController.getProjects);

// Get a specific project by ID
router.get('/:projectId', authMiddleware, projectController.getProjectById);

// Update project details
router.put('/:projectId', authMiddleware, projectController.updateProject);

// Delete a project
router.delete('/:projectId', authMiddleware, projectController.deleteProject);

// Update required roles for an action
router.put('/:projectId/required-roles', authMiddleware, projectController.updateRequiredRoles);

// Get required roles for a project
router.get('/:projectId/required-roles', authMiddleware, projectController.getRequiredRoles);

module.exports = router;
