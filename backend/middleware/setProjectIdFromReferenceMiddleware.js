const Reference = require('../models/Reference');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');


async function setProjectIdFromReference(req, res, next) {
    try {
      const referenceId = req.body.referenceId || req.params.referenceId;
  
      if (!referenceId) {
        return res.status(400).json({ error: 'referenceId is required' });
      }
  
      const reference = await Reference.findById(referenceId);
  
      if (!reference) {
        return res.status(404).json({ error: 'Reference not found' });
      }
  
      if (!reference.project) {
        return res.status(400).json({ error: 'Reference is not associated with a project' });
      }
  
      req.params.projectId = reference.project.toString();
      next();
    } catch (err) {
      console.error('Error in setProjectIdFromReference:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  module.exports = setProjectIdFromReferenceMiddleware;
