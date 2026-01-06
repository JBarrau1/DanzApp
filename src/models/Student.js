// Student Model
// Represents a student enrolled in the dance academy

export class Student {
  constructor({
    id = null,
    name = '',
    phone = '',
    email = '',
    enrollmentDate = new Date(),
    status = 'active', // active, inactive, suspended
    notes = ''
  }) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.enrollmentDate = enrollmentDate;
    this.status = status;
    this.notes = notes;
  }

  // Validate student data
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!this.phone || this.phone.trim().length === 0) {
      errors.push('Phone is required');
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
      name: this.name,
      phone: this.phone,
      email: this.email,
      enrollmentDate: this.enrollmentDate.toISOString(),
      status: this.status,
      notes: this.notes
    };
  }

  // Create from plain object
  static fromJSON(json) {
    return new Student({
      ...json,
      enrollmentDate: new Date(json.enrollmentDate)
    });
  }
}
