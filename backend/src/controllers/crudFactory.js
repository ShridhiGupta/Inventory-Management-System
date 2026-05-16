const { validationResult } = require('express-validator');

const createCrudController = (Model, modelName) => {
  return {
    getAll: async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { search, status } = req.query;

        let filter = {};
        if (search) {
          filter.name = { $regex: search, $options: 'i' };
        }
        if (status) {
          filter.status = status;
        }

        const items = await Model.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        const total = await Model.countDocuments(filter);

        res.json({
          message: `${modelName}s retrieved successfully`,
          data: items,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error(`Get ${modelName}s error:`, error);
        res.status(500).json({ message: `Server error retrieving ${modelName}s` });
      }
    },

    getOne: async (req, res) => {
      try {
        const item = await Model.findById(req.params.id);
        if (!item) {
          return res.status(404).json({ message: `${modelName} not found` });
        }
        res.json({ message: `${modelName} retrieved successfully`, data: item });
      } catch (error) {
        console.error(`Get ${modelName} error:`, error);
        res.status(500).json({ message: `Server error retrieving ${modelName}` });
      }
    },

    create: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const data = { ...req.body, createdBy: req.user?._id };
        const item = new Model(data);
        await item.save();

        res.status(201).json({ message: `${modelName} created successfully`, data: item });
      } catch (error) {
        console.error(`Create ${modelName} error:`, error);
        res.status(500).json({ message: `Server error creating ${modelName}` });
      }
    },

    update: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const item = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );

        if (!item) {
          return res.status(404).json({ message: `${modelName} not found` });
        }

        res.json({ message: `${modelName} updated successfully`, data: item });
      } catch (error) {
        console.error(`Update ${modelName} error:`, error);
        res.status(500).json({ message: `Server error updating ${modelName}` });
      }
    },

    delete: async (req, res) => {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) {
          return res.status(404).json({ message: `${modelName} not found` });
        }
        res.json({ message: `${modelName} deleted successfully`, data: item });
      } catch (error) {
        console.error(`Delete ${modelName} error:`, error);
        res.status(500).json({ message: `Server error deleting ${modelName}` });
      }
    }
  };
};

module.exports = { createCrudController };
