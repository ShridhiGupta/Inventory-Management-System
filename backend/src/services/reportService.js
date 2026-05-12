const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const logger = require('../utils/logger');

class ReportService {
  async generateSalesReport(startDate, endDate, storeId) {
    try {
      const matchStage = {
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        type: 'SALE'
      };

      if (storeId) {
        matchStage.fromLocationId = storeId;
      }

      const salesData = await Transaction.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
              productId: '$items.productId'
            },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.totalPrice' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$_id.date',
            totalRevenue: { $sum: '$revenue' },
            totalQuantity: { $sum: '$quantity' },
            uniqueProducts: { $addToSet: '$product.name' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return salesData;
    } catch (error) {
      logger.error('Error generating sales report:', error);
      throw error;
    }
  }

  async generateInventoryReport(warehouseId, storeId) {
    try {
      const matchStage = {};
      if (warehouseId) {
        matchStage.warehouseId = warehouseId;
      }
      if (storeId) {
        matchStage.storeId = storeId;
      }

      const inventoryData = await Inventory.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            totalProducts: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$quantity', '$costPerUnit'] } },
            lowStockItems: {
              $sum: {
                $cond: [
                  { $lte: ['$availableQuantity', '$product.minStockLevel'] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      return inventoryData;
    } catch (error) {
      logger.error('Error generating inventory report:', error);
      throw error;
    }
  }

  async generateVendorReport(vendorId, startDate, endDate) {
    try {
      const matchStage = {
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        type: 'PURCHASE'
      };

      if (vendorId) {
        matchStage.fromLocationId = vendorId;
      }

      const vendorData = await Transaction.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$fromLocationId',
            totalPurchases: { $sum: '$finalAmount' },
            totalItems: { $sum: '$items.quantity' },
            avgOrderValue: { $avg: '$finalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'vendors',
            localField: '_id',
            foreignField: '_id',
            as: 'vendor'
          }
        },
        { $unwind: '$vendor' },
        { $sort: { totalPurchases: -1 } }
      ]);

      return vendorData;
    } catch (error) {
      logger.error('Error generating vendor report:', error);
      throw error;
    }
  }

  async generateProfitLossReport(startDate, endDate) {
    try {
      const matchStage = {
        transactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const [salesData, purchaseData] = await Promise.all([
        Transaction.aggregate([
          { $match: { ...matchStage, type: 'SALE' } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$finalAmount' },
              totalTax: { $sum: '$taxAmount' },
              totalSales: { $sum: 1 }
            }
          }
        ]),
        Transaction.aggregate([
          { $match: { ...matchStage, type: 'PURCHASE' } },
          {
            $group: {
              _id: null,
              totalCost: { $sum: '$finalAmount' },
              totalPurchases: { $sum: 1 }
            }
          }
        ])
      ]);

      const sales = salesData[0] || { totalRevenue: 0, totalTax: 0, totalSales: 0 };
      const purchases = purchaseData[0] || { totalCost: 0, totalPurchases: 0 };

      const grossProfit = sales.totalRevenue - purchases.totalCost;
      const netProfit = grossProfit - (sales.totalTax * 0.3); // Assuming 30% of tax is deductible

      return {
        period: { startDate, endDate },
        revenue: sales.totalRevenue,
        cost: purchases.totalCost,
        grossProfit,
        netProfit,
        totalTransactions: sales.totalSales + purchases.totalPurchases,
        profitMargin: sales.totalRevenue > 0 ? (grossProfit / sales.totalRevenue * 100).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Error generating profit loss report:', error);
      throw error;
    }
  }

  async generateCustomerReport(startDate, endDate) {
    try {
      // This would require a Customer model, for now returning mock data
      const customerData = {
        totalCustomers: 1250,
        newCustomers: 89,
        returningCustomers: 1161,
        averageOrderValue: 285.50,
        topCustomers: [
          { name: 'John Doe', orders: 45, totalSpent: 12850 },
          { name: 'Jane Smith', orders: 38, totalSpent: 10200 },
          { name: 'Bob Johnson', orders: 32, totalSpent: 8900 }
        ]
      };

      return customerData;
    } catch (error) {
      logger.error('Error generating customer report:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();
