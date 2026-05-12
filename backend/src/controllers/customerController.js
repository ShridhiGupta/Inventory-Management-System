const Customer = require('../models/Customer');

const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    const customers = await Customer.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Customer.countDocuments(filter);
    res.json({
      message: 'Customers retrieved successfully',
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (e) {
    console.error('getAllCustomers', e);
    res.status(500).json({ message: 'Failed to list customers' });
  }
};

module.exports = { getAllCustomers };
