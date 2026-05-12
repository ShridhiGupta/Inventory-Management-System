const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    // Initialize email transporter (would use nodemailer in production)
    // For now, we'll just log emails
    logger.info('Email service initialized');
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      const emailContent = {
        to: userEmail,
        subject: 'Welcome to Inventory Management System',
        html: `
          <h1>Welcome ${userName}!</h1>
          <p>Thank you for joining our Inventory Management System.</p>
          <p>Your account has been successfully created.</p>
          <p>Please login to get started.</p>
        `
      };

      logger.info(`Welcome email sent to ${userEmail}`, emailContent);
      return true;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const emailContent = {
        to: userEmail,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `
      };

      logger.info(`Password reset email sent to ${userEmail}`, emailContent);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendLowStockAlert(storeEmail, products) {
    try {
      const productList = products.map(p => `<li>${p.name} - ${p.quantity} units left</li>`).join('');
      
      const emailContent = {
        to: storeEmail,
        subject: 'Low Stock Alert',
        html: `
          <h1>Low Stock Alert</h1>
          <p>The following products are running low on stock:</p>
          <ul>${productList}</ul>
          <p>Please restock these items soon.</p>
        `
      };

      logger.info(`Low stock alert sent to ${storeEmail}`, emailContent);
      return true;
    } catch (error) {
      logger.error('Error sending low stock alert:', error);
      return false;
    }
  }

  async sendTransactionReceipt(userEmail, transaction) {
    try {
      const itemsList = transaction.items.map(item => 
        `<li>${item.productId.name} - ${item.quantity} x $${item.unitPrice} = $${item.totalPrice}</li>`
      ).join('');
      
      const emailContent = {
        to: userEmail,
        subject: `Transaction Receipt - ${transaction.transactionNumber}`,
        html: `
          <h1>Transaction Receipt</h1>
          <p><strong>Transaction Number:</strong> ${transaction.transactionNumber}</p>
          <p><strong>Date:</strong> ${new Date(transaction.transactionDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> $${transaction.finalAmount}</p>
          <h3>Items:</h3>
          <ul>${itemsList}</ul>
          <p>Thank you for your business!</p>
        `
      };

      logger.info(`Transaction receipt sent to ${userEmail}`, emailContent);
      return true;
    } catch (error) {
      logger.error('Error sending transaction receipt:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
