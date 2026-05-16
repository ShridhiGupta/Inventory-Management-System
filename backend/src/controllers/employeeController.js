const { validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, role, department, storeId, warehouseId, isActive, employeeType, status } = req.query;
    
    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (department) {
      filter.department = department;
    }
    
    if (storeId) {
      filter.storeId = storeId;
    }
    
    if (warehouseId) {
      filter.warehouseId = warehouseId;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (employeeType) {
      filter.employeeType = employeeType;
    }

    if (status) {
      filter.status = status;
    }
    
    const employees = await Employee.find(filter)
      .populate('storeId', 'name code')
      .populate('warehouseId', 'name code')
      .populate('vendorId', 'name')
      .populate('manager', 'fullName firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Employee.countDocuments(filter);

    // Dashboard Statistics
    const totalEmployees = await Employee.countDocuments({});
    const activeEmployees = await Employee.countDocuments({ status: 'ACTIVE' });
    const inactiveEmployees = await Employee.countDocuments({ status: { $in: ['INACTIVE', 'SUSPENDED'] } });
    
    const departmentCountsRaw = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const departmentCounts = departmentCountsRaw.reduce((acc, curr) => {
      acc[curr._id || 'UNASSIGNED'] = curr.count;
      return acc;
    }, {});
    
    res.json({
      message: 'Employees retrieved successfully',
      employees,
      dashboardStats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentCounts
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error retrieving employees' });
  }
};

// Get single employee
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id)
      .populate('storeId', 'name code address')
      .populate('warehouseId', 'name code address')
      .populate('vendorId', 'name address')
      .populate('manager', 'fullName firstName lastName email position')
      .populate('reports', 'fullName firstName lastName email position')
      .populate('createdBy', 'firstName lastName email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({
      message: 'Employee retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error retrieving employee' });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const employeeData = req.body;
    
    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }
    
    if (req.user) {
      employeeData.createdBy = req.user._id;
    }
    
    // Create employee
    const employee = new Employee(employeeData);
    await employee.save();
    
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('storeId', 'name code')
      .populate('warehouseId', 'name code')
      .populate('vendorId', 'name')
      .populate('manager', 'fullName firstName lastName email');
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee: populatedEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error creating employee' });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingEmployee = await Employee.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
    }
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('storeId', 'name code')
     .populate('warehouseId', 'name code')
     .populate('vendorId', 'name')
     .populate('manager', 'fullName firstName lastName email');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error updating employee' });
  }
};

// Delete employee (soft delete)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { isActive: false, status: 'INACTIVE' },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({
      message: 'Employee deleted successfully',
      employee
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
};

// Get employees by store
const getEmployeesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const employees = await Employee.find({ storeId, isActive: true })
      .populate('manager', 'firstName lastName email')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json({
      message: 'Store employees retrieved successfully',
      employees
    });
  } catch (error) {
    console.error('Get store employees error:', error);
    res.status(500).json({ message: 'Server error retrieving store employees' });
  }
};

// Get employees by warehouse
const getEmployeesByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    
    const employees = await Employee.find({ warehouseId, isActive: true })
      .populate('manager', 'firstName lastName email')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json({
      message: 'Warehouse employees retrieved successfully',
      employees
    });
  } catch (error) {
    console.error('Get warehouse employees error:', error);
    res.status(500).json({ message: 'Server error retrieving warehouse employees' });
  }
};

// Update employee last login
const updateLastLogin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({
      message: 'Last login updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update last login error:', error);
    res.status(500).json({ message: 'Server error updating last login' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByStore,
  getEmployeesByWarehouse,
  updateLastLogin
};
