// Payment Model
// Represents a payment record for student tuition

export class Payment {
  constructor({
    id = null,
    studentId = null,
    studentName = '',
    amount = 0,
    dueDate = new Date(),
    paymentDate = null,
    status = 'pending', // pending, paid, overdue, partial
    method = '', // cash, card, transfer, other
    notes = '',
    monthYear = '' // e.g., "Enero 2026"
  }) {
    this.id = id;
    this.studentId = studentId;
    this.studentName = studentName;
    this.amount = amount;
    this.dueDate = dueDate;
    this.paymentDate = paymentDate;
    this.status = status;
    this.method = method;
    this.notes = notes;
    this.monthYear = monthYear;
  }

  // Validate payment data
  validate() {
    const errors = [];
    
    if (!this.studentId) {
      errors.push('Student ID is required');
    }
    
    if (!this.amount || this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (!this.dueDate) {
      errors.push('Due date is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if payment is overdue
  isOverdue() {
    if (this.status === 'paid') return false;
    return new Date() > new Date(this.dueDate);
  }

  // Update status based on dates
  updateStatus() {
    if (this.paymentDate) {
      this.status = 'paid';
    } else if (this.isOverdue()) {
      this.status = 'overdue';
    } else {
      this.status = 'pending';
    }
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      studentName: this.studentName,
      amount: this.amount,
      dueDate: this.dueDate.toISOString(),
      paymentDate: this.paymentDate ? this.paymentDate.toISOString() : null,
      status: this.status,
      method: this.method,
      notes: this.notes,
      monthYear: this.monthYear
    };
  }

  // Create from plain object
  static fromJSON(json) {
    return new Payment({
      ...json,
      dueDate: new Date(json.dueDate),
      paymentDate: json.paymentDate ? new Date(json.paymentDate) : null
    });
  }

  // Get status color for UI
  getStatusColor() {
    switch (this.status) {
      case 'paid':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'overdue':
        return '#F44336';
      case 'partial':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  }
}
