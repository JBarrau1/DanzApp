// Attendance Model
// Represents an attendance record for a student

export class Attendance {
  constructor({
    id = null,
    studentId = null,
    studentName = '',
    date = new Date(),
    status = 'present', // present, absent, late, excused
    notes = '',
    classType = '' // e.g., Ballet, Hip Hop, Contemporary
  }) {
    this.id = id;
    this.studentId = studentId;
    this.studentName = studentName;
    this.date = date;
    this.status = status;
    this.notes = notes;
    this.classType = classType;
  }

  // Validate attendance data
  validate() {
    const errors = [];
    
    if (!this.studentId) {
      errors.push('Student ID is required');
    }
    
    if (!this.date) {
      errors.push('Date is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      studentName: this.studentName,
      date: this.date.toISOString(),
      status: this.status,
      notes: this.notes,
      classType: this.classType
    };
  }

  // Create from plain object
  static fromJSON(json) {
    return new Attendance({
      ...json,
      date: new Date(json.date)
    });
  }

  // Get status color for UI
  getStatusColor() {
    switch (this.status) {
      case 'present':
        return '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'absent':
        return '#F44336';
      case 'excused':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  }
}
