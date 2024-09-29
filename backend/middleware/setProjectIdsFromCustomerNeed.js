const CustomerNeed = require('../models/CustomerNeed');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

/**
 * Middleware to set projectIds from CustomerNeed
 * - For POST: get projectIds from the Customer's invoices
 * - For PUT/DELETE: get projectIds from the existing CustomerNeed's Customer's invoices
 */
async function setProjectIdsFromCustomerNeed(req, res, next) {
  try {
    let projectIds = [];

    if (req.method === 'POST') {
      // For creating a new CustomerNeed, get projectIds from req.body.customer
      const customerId = req.body.customer;
      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required in the request body.' });
      }

      const customer = await Customer.findById(customerId).populate('invoices');
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found.' });
      }

      // Extract projectIds from customer's invoices
      customer.invoices.forEach((invoice) => {
        if (invoice.project) {
          projectIds.push(invoice.project.toString());
        }
      });
    } else {
      // For updating or deleting an existing CustomerNeed, get projectIds from the Customer's invoices
      const customerNeedId = req.params.id;
      if (!customerNeedId) {
        return res.status(400).json({ error: 'CustomerNeed ID is required in the request parameters.' });
      }

      const customerNeed = await CustomerNeed.findById(customerNeedId).populate('customer');
      if (!customerNeed || !customerNeed.customer) {
        return res.status(404).json({ error: 'CustomerNeed or associated Customer not found.' });
      }

      const customer = await Customer.findById(customerNeed.customer._id).populate('invoices');
      if (!customer) {
        return res.status(404).json({ error: 'Associated Customer not found.' });
      }

      // Extract projectIds from customer's invoices
      customer.invoices.forEach((invoice) => {
        if (invoice.project) {
          projectIds.push(invoice.project.toString());
        }
      });
    }

    // Remove duplicate projectIds
    projectIds = [...new Set(projectIds)];

    // Attach projectIds to request parameters for access control
    req.params.projectIds = projectIds;

    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromCustomerNeed:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = setProjectIdsFromCustomerNeed;
