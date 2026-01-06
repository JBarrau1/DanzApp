// Attendance Controller
// Business logic for attendance management

import { Attendance } from '../models/Attendance';

export class AttendanceController {
  constructor() {
    // In a real app, this would connect to a database or API
    this.attendances = this.getSampleAttendances();
  }

  // Get all attendances
  getAllAttendances() {
    return this.attendances;
  }

  // Get attendances for a specific date
  getAttendancesByDate(date) {
    const targetDate = new Date(date).toDateString();
    return this.attendances.filter(
      a => new Date(a.date).toDateString() === targetDate
    );
  }

  // Get attendances for a specific student
  getAttendancesByStudent(studentId) {
    return this.attendances.filter(a => a.studentId === studentId);
  }

  // Record new attendance
  recordAttendance(attendanceData) {
    const attendance = new Attendance(attendanceData);
    const validation = attendance.validate();
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }
    
    // Generate ID (in real app, this would be from database)
    attendance.id = this.attendances.length + 1;
    
    this.attendances.push(attendance);
    
    return {
      success: true,
      attendance,
    };
  }

  // Update attendance status
  updateAttendanceStatus(attendanceId, newStatus) {
    const attendance = this.attendances.find(a => a.id === attendanceId);
    
    if (!attendance) {
      return {
        success: false,
        error: 'Attendance not found',
      };
    }
    
    attendance.status = newStatus;
    
    return {
      success: true,
      attendance,
    };
  }

  // Calculate attendance rate for a student
  calculateAttendanceRate(studentId, startDate = null, endDate = null) {
    let studentAttendances = this.getAttendancesByStudent(studentId);
    
    // Filter by date range if provided
    if (startDate) {
      studentAttendances = studentAttendances.filter(
        a => new Date(a.date) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      studentAttendances = studentAttendances.filter(
        a => new Date(a.date) <= new Date(endDate)
      );
    }
    
    const total = studentAttendances.length;
    const present = studentAttendances.filter(
      a => a.status === 'present' || a.status === 'late'
    ).length;
    
    return {
      total,
      present,
      rate: total > 0 ? (present / total) * 100 : 0,
    };
  }

  // Get today's attendance summary
  getTodaySummary() {
    const today = new Date();
    const todayAttendances = this.getAttendancesByDate(today);
    
    const summary = {
      total: todayAttendances.length,
      present: todayAttendances.filter(a => a.status === 'present').length,
      late: todayAttendances.filter(a => a.status === 'late').length,
      absent: todayAttendances.filter(a => a.status === 'absent').length,
      excused: todayAttendances.filter(a => a.status === 'excused').length,
    };
    
    return summary;
  }

  // Sample data (to be replaced with real data storage)
  getSampleAttendances() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
      new Attendance({
        id: 1,
        studentId: 1,
        studentName: 'María García',
        date: today,
        status: 'present',
        classType: 'Ballet',
      }),
      new Attendance({
        id: 2,
        studentId: 2,
        studentName: 'Juan Pérez',
        date: today,
        status: 'present',
        classType: 'Hip Hop',
      }),
      new Attendance({
        id: 3,
        studentId: 3,
        studentName: 'Ana Martínez',
        date: today,
        status: 'late',
        classType: 'Contemporary',
      }),
      new Attendance({
        id: 4,
        studentId: 1,
        studentName: 'María García',
        date: yesterday,
        status: 'present',
        classType: 'Ballet',
      }),
    ];
  }
}
