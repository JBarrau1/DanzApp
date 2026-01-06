// Home Controller (Updated for Supabase)
// Business logic for the home dashboard using real database data

import { EstudianteService } from '../services/EstudianteService';
import { AsistenciaService } from '../services/AsistenciaService';
import { MensualidadService } from '../services/MensualidadService';

export class HomeController {
  constructor() {
    // No longer using sample data - all data comes from Supabase
  }

  // Get dashboard statistics (async)
  async getStatistics() {
    try {
      // Get student counts
      const totalResult = await EstudianteService.getCount();
      const activeResult = await EstudianteService.getActiveCount();
      
      // Get today's attendance summary
      const attendanceResult = await AsistenciaService.getTodaySummary();
      
      // Get payment statistics
      const paymentResult = await MensualidadService.getStatistics();
      
      return {
        totalStudents: totalResult.count || 0,
        activeStudents: activeResult.count || 0,
        presentToday: attendanceResult.data?.presente || 0,
        totalToday: attendanceResult.data?.total || 0,
        pendingPayments: (paymentResult.data?.pendiente || 0) + (paymentResult.data?.vencido || 0),
        overduePayments: paymentResult.data?.vencido || 0,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        presentToday: 0,
        totalToday: 0,
        pendingPayments: 0,
        overduePayments: 0,
      };
    }
  }

  // Get recent activities (async)
  async getRecentActivities() {
    try {
      const activities = [];
      
      // Get recent attendances (last 5)
      const attendanceResult = await AsistenciaService.getAll();
      if (attendanceResult.success && attendanceResult.data) {
        const recentAttendances = attendanceResult.data.slice(0, 3);
        
        recentAttendances.forEach(att => {
          activities.push({
            type: 'attendance',
            title: `${att.estudiante_nombre} - ${att.getStatusText()}`,
            date: att.fecha,
            icon: 'checkmark-circle',
          });
        });
      }
      
      // Get recent payments (last 3 paid)
      const paymentResult = await MensualidadService.getByStatus('pagado');
      if (paymentResult.success && paymentResult.data) {
        const recentPayments = paymentResult.data
          .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
          .slice(0, 2);
        
        recentPayments.forEach(pay => {
          activities.push({
            type: 'payment',
            title: `${pay.estudiante_nombre} - $${pay.monto_total}`,
            date: pay.fecha_pago,
            icon: 'cash',
          });
        });
      }
      
      // Sort by date and return top 5
      return activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }
}
