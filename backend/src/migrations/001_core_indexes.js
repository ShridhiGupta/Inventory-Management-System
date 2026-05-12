/**
 * Core indexes for Inventory Management System collections.
 * Safe to re-run logic: createIndex is idempotent for the same spec.
 */
module.exports = {
  async up(db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ vendorId: 1 });
    await db.collection('products').createIndex({
      name: 'text',
      description: 'text',
      tags: 'text'
    });

    await db.collection('inventories').createIndex(
      { productId: 1, warehouseId: 1, storeId: 1 },
      { unique: true }
    );
    await db.collection('inventories').createIndex({ productId: 1 });
    await db.collection('inventories').createIndex({ warehouseId: 1 });
    await db.collection('inventories').createIndex({ storeId: 1 });
    await db.collection('inventories').createIndex({ status: 1 });

    await db.collection('transactions').createIndex({ transactionNumber: 1 }, { unique: true });
    await db.collection('transactions').createIndex({ type: 1 });
    await db.collection('transactions').createIndex({ status: 1 });
    await db.collection('transactions').createIndex({ transactionDate: -1 });
    await db.collection('transactions').createIndex({ createdBy: 1 });
    await db.collection('transactions').createIndex({ paymentStatus: 1 });
    await db.collection('transactions').createIndex({ type: 1, status: 1 });

    await db.collection('vendors').createIndex({ name: 1 });
    await db.collection('vendors').createIndex({ email: 1 }, { unique: true, sparse: true });

    await db.collection('warehouses').createIndex({ code: 1 }, { unique: true });
    await db.collection('warehouses').createIndex({ manager: 1 });

    await db.collection('stores').createIndex({ code: 1 }, { unique: true });
    await db.collection('stores').createIndex({ manager: 1 });
    await db.collection('stores').createIndex({ warehouseId: 1 });

    await db.collection('employees').createIndex({ email: 1 }, { unique: true });
    await db.collection('employees').createIndex({ role: 1 });
    await db.collection('employees').createIndex({ department: 1 });

    await db.collection('promotions').createIndex({ code: 1 }, { unique: true });
    await db.collection('promotions').createIndex({ startDate: 1, endDate: 1 });
  }
};
