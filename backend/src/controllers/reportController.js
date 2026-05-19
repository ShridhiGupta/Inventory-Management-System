const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');

const reportGroups = [
  {
    name: 'Orders',
    reports: [
      'List Of Orders',
      'Order Details',
      'Order Wise Payment Breakup',
      'Order Payment History',
      'Order Transaction Tracker',
      'List Of Void Orders',
      'Product In Orders',
      'Product Transaction Tracker',
      'Order Combo Report'
    ]
  },
  {
    name: 'Promotions',
    reports: [
      'Product Discount Report',
      'Discount Expenses',
      'Discounted Products',
      'Order Discount Report',
      'Coupon Redemption',
      'Discount Performance Report',
      'Membership Tracker',
      'Membership Purchase History'
    ]
  },
  {
    name: 'Proforma Invoices',
    reports: [
      'List of PI',
      'PI Detail',
      'Product in PI',
      'PI Product level Discount',
      'PI Payment Breakup',
      'PI Payment History',
      'PI Product Sale Transaction Tracker'
    ]
  },
  {
    name: 'Sales',
    reports: [
      'Daily Sales',
      'Location Wise Sales',
      'Region Wise Sales',
      'Store Wise Sales',
      'Store Wise Product Sales',
      'Device Wise Sales',
      'Customer Wise Sales',
      'Employee Wise Sales',
      'Employee Wise Product Sales',
      'Store Hourly Sales',
      'Daily Payment Breakup',
      'Entity Wise Sales',
      'Product Wise Sales',
      'Department Wise Sales',
      'Category Wise Sales',
      'Sub Category Wise Sales',
      'Brand Wise Sales',
      'Income Head Wise Sales',
      'Fiscal Report'
    ]
  },
  {
    name: 'Online Order',
    reports: [
      'List Of Online Orders',
      'Online Order Detail',
      'Product In Online orders',
      'Product Wise Online Sales'
    ]
  },
  {
    name: 'Inventory',
    reports: [
      'Stock Level',
      'Store Wise Stock Level',
      'Product Group Stock Level',
      'Stock Operations',
      'Stock Operations Detail',
      'Stock Requisition',
      'Unfulfilled Stock Requests',
      'Unfulfilled Stock Transfers',
      'Product Ageing Report',
      'Profit Margin',
      'Low Stock Products',
      'Stock Ledger Summary',
      'Stock Movement',
      'Stock Movement Detail',
      'Stock Fulfillment'
    ]
  },
  {
    name: 'Insights',
    reports: [
      'ABC-XYZ Classification',
      'Inventory Accuracy Scorecard',
      'Dead Stock Detector',
      'Stockout Predictor',
      'Smart Reorder',
      'GMROI Capital Efficiency',
      'Bill-Level Margin Monitor',
      'Revenue Leakage Detector',
      'Discount & Margin Analyzer',
      'Basket & Affinity Insights',
      'POS Cash Variance Alerts',
      'Purchase Price Variance',
      'Fulfillment Leakage Tracker',
      'Store Peer Benchmarking'
    ]
  },
  {
    name: 'Accounting Reports',
    reports: [
      'Order Wise Tax Breakup',
      'Product Wise Tax Breakup',
      'HSN/SAC Wise Tax Breakup'
    ]
  },
  {
    name: 'Purchase',
    reports: [
      'List Of Purchase Orders',
      'Product In Purchase Orders',
      'Purchase Order Details',
      'Vendor Tax Input',
      'Vendor Purchase Summary',
      'Vendor Product Purchase Summary'
    ]
  },
  {
    name: 'Custom Reports',
    reports: ['ELR Report', 'Daily Sales Summary']
  },
  {
    name: 'Logs',
    reports: ['Product Logs', 'System Change Logs', 'Order Sync Logs']
  }
];

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const getReportsDashboard = async (req, res) => {
  try {
    const { start, end } = todayRange();

    const [orderStats, inventoryStats] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            type: 'SALE',
            transactionDate: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            grossSales: { $sum: '$totalAmount' },
            netSales: { $sum: '$finalAmount' },
            discount: { $sum: '$discountAmount' }
          }
        }
      ]),
      Inventory.aggregate([
        {
          $group: {
            _id: null,
            skuCount: { $sum: 1 },
            lowSkuCount: {
              $sum: {
                $cond: [{ $lte: ['$availableQuantity', 20] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const orders = orderStats[0] || { orders: 0, grossSales: 0, netSales: 0, discount: 0 };
    const stock = inventoryStats[0] || { skuCount: 0, lowSkuCount: 0 };

    res.json({
      message: 'Reports dashboard retrieved successfully',
      pinned: [
        {
          id: 'orders-list',
          title: 'Orders list',
          period: 'Today',
          value: orders.orders,
          suffix: 'orders',
          trend: '+12%'
        },
        {
          id: 'daily-sales',
          title: 'Daily Sales (DSR)',
          period: 'Today',
          value: orders.grossSales,
          currency: 'INR',
          trend: '+8.4%'
        },
        {
          id: 'net-sales',
          title: 'Net sales',
          period: 'Today, after tax & discount',
          value: orders.netSales,
          currency: 'INR',
          trend: '+8.4%'
        },
        {
          id: 'stock-level',
          title: 'Stock level',
          period: 'Now',
          value: stock.lowSkuCount,
          suffix: 'SKUs low',
          trend: 'watch'
        }
      ],
      groups: reportGroups,
      totals: {
        reports: reportGroups.reduce((sum, group) => sum + group.reports.length, 0),
        pinned: 4,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get reports dashboard error:', error);
    res.status(500).json({ message: 'Failed to load reports dashboard' });
  }
};

module.exports = {
  getReportsDashboard
};
