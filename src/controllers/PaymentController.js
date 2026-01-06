// Payment Controller
// Business logic for payment management

import { Payment } from '../models/Payment';

export class PaymentController {
  constructor() {
    // In a real app, this would connect to a database or API
    this.payments = this.getSamplePayments();
  }

  // Get all payments
  getAllPayments() {
    return this.payments;
  }

  // Get payments by status
  getPaymentsByStatus(status) {
    return this.payments.filter(p => p.status === status);
  }

  // Get payments for a specific student
  getPaymentsByStudent(studentId) {
    return this.payments.filter(p => p.studentId === studentId);
  }

  // Get overdue payments
  getOverduePayments() {
    return this.payments.filter(p => p.isOverdue());
  }

  // Record new payment
  recordPayment(paymentData) {
    const payment = new Payment(paymentData);
    const validation = payment.validate();
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }
    
    // Generate ID (in real app, this would be from database)
    payment.id = this.payments.length + 1;
    payment.updateStatus();
    
    this.payments.push(payment);
    
    return {
      success: true,
      payment,
    };
  }

  // Process payment (mark as paid)
  processPayment(paymentId, paymentDate, method) {
    const payment = this.payments.find(p => p.id === paymentId);
    
    if (!payment) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }
    
    payment.paymentDate = paymentDate || new Date();
    payment.method = method;
    payment.updateStatus();
    
    return {
      success: true,
      payment,
    };
  }

  // Calculate payment statistics
  getPaymentStatistics() {
    const total = this.payments.length;
    const paid = this.payments.filter(p => p.status === 'paid').length;
    const pending = this.payments.filter(p => p.status === 'pending').length;
    const overdue = this.payments.filter(p => p.status === 'overdue').length;
    
    const totalAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = this.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = this.payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount,
      collectionRate: total > 0 ? (paid / total) * 100 : 0,
    };
  }

  // Get payments for current month
  getCurrentMonthPayments() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return this.payments.filter(p => {
      const paymentDate = new Date(p.dueDate);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });
  }

  // Update all payment statuses (run periodically)
  updateAllStatuses() {
    this.payments.forEach(payment => {
      payment.updateStatus();
    });
  }

  // Sample data (to be replaced with real data storage)
  getSamplePayments() {
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      new Payment({
        id: 1,
        studentId: 1,
        studentName: 'María García',
        amount: 100,
        dueDate: new Date('2026-01-05'),
        paymentDate: new Date('2026-01-03'),
        status: 'paid',
        method: 'cash',
        monthYear: 'Enero 2026',
      }),
      new Payment({
        id: 2,
        studentId: 2,
        studentName: 'Juan Pérez',
        amount: 100,
        dueDate: new Date('2026-01-10'),
        status: 'pending',
        monthYear: 'Enero 2026',
      }),
      new Payment({
        id: 3,
        studentId: 3,
        studentName: 'Ana Martínez',
        amount: 100,
        dueDate: new Date('2025-12-15'),
        status: 'overdue',
        monthYear: 'Diciembre 2025',
      }),
      new Payment({
        id: 4,
        studentId: 1,
        studentName: 'María García',
        amount: 100,
        dueDate: lastMonth,
        paymentDate: lastMonth,
        status: 'paid',
        method: 'transfer',
        monthYear: 'Diciembre 2025',
      }),
    ];
  }
}
