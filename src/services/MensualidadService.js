// Mensualidad Service
// Service layer for mensualidad (monthly payment) database operations

import { supabase } from '../config/supabase';
import { Mensualidad } from '../models/Mensualidad';

export class MensualidadService {
  // Get all payments
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('mensualidades')
        .select('*, estudiantes(nombres, apellidos)')
        .order('anio', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;
      
      // Convert to Mensualidad instances
      const mensualidades = data.map(item => {
        const mensualidad = Mensualidad.fromJSON(item);
        mensualidad.estudiante_nombre = item.estudiantes ? 
          `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'Desconocido';
        return mensualidad;
      });
      
      return {
        success: true,
        data: mensualidades,
      };
    } catch (error) {
      console.error('Error fetching mensualidades:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get payments by status
  static async getByStatus(estado) {
    try {
      const { data, error } = await supabase
        .from('mensualidades')
        .select('*, estudiantes(nombres, apellidos)')
        .eq('estado', estado)
        .order('fecha_vencimiento', { ascending: true });

      if (error) throw error;
      
      // Convert to Mensualidad instances
      const mensualidades = data.map(item => {
        const mensualidad = Mensualidad.fromJSON(item);
        mensualidad.estudiante_nombre = item.estudiantes ? 
          `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'Desconocido';
        return mensualidad;
      });
      
      return {
        success: true,
        data: mensualidades,
      };
    } catch (error) {
      console.error('Error fetching mensualidades by status:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get overdue payments
  static async getOverdue() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('mensualidades')
        .select('*, estudiantes(nombres, apellidos, elenco_id, elencos(nombre))')
        .neq('estado', 'pagado')
        .lt('fecha_vencimiento', today)
        .order('fecha_vencimiento', { ascending: true });

      if (error) throw error;
      
      // Convert to Mensualidad instances
      const mensualidades = data.map(item => {
        const mensualidad = Mensualidad.fromJSON(item);
        mensualidad.estudiante_nombre = item.estudiantes ? 
          `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'Desconocido';
        mensualidad.elenco_nombre = item.estudiantes?.elencos?.nombre || 'Sin elenco';
        return mensualidad;
      });
      
      return {
        success: true,
        data: mensualidades,
      };
    } catch (error) {
      console.error('Error fetching overdue mensualidades:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get payments by student
  static async getByStudent(estudianteId) {
    try {
      const { data, error } = await supabase
        .from('mensualidades')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .order('anio', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;
      
      // Convert to Mensualidad instances
      const mensualidades = data.map(item => Mensualidad.fromJSON(item));
      
      return {
        success: true,
        data: mensualidades,
      };
    } catch (error) {
      console.error('Error fetching mensualidades by student:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get payment statistics
  static async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('mensualidades')
        .select('estado, monto_total, monto_pagado, descuento');

      if (error) throw error;

      const stats = {
        total: data.length,
        pagado: data.filter(m => m.estado === 'pagado').length,
        pendiente: data.filter(m => m.estado === 'pendiente').length,
        vencido: data.filter(m => m.estado === 'vencido').length,
        parcial: data.filter(m => m.estado === 'parcial').length,
        totalAmount: data.reduce((sum, m) => sum + parseFloat(m.monto_total || 0), 0),
        paidAmount: data.reduce((sum, m) => sum + parseFloat(m.monto_pagado || 0), 0),
        pendingAmount: data
          .filter(m => m.estado !== 'pagado')
          .reduce((sum, m) => sum + (parseFloat(m.monto_total || 0) - parseFloat(m.descuento || 0) - parseFloat(m.monto_pagado || 0)), 0),
      };

      stats.collectionRate = stats.total > 0 ? (stats.pagado / stats.total) * 100 : 0;

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      return {
        success: false,
        error: error.message,
        data: {
          total: 0,
          pagado: 0,
          pendiente: 0,
          vencido: 0,
          parcial: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          collectionRate: 0,
        },
      };
    }
  }

  // Create payment
  static async create(mensualidadData) {
    try {
      const mensualidad = new Mensualidad(mensualidadData);
      const validation = mensualidad.validate();
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          data: null,
        };
      }

      // Update status before saving
      mensualidad.actualizarEstado();

      const { data, error } = await supabase
        .from('mensualidades')
        .insert([mensualidad.toJSON()])
        .select('*, estudiantes(nombres, apellidos)')
        .single();

      if (error) throw error;
      
      // Convert to Mensualidad instance
      const newMensualidad = Mensualidad.fromJSON(data);
      newMensualidad.estudiante_nombre = data.estudiantes ? 
        `${data.estudiantes.nombres} ${data.estudiantes.apellidos}` : 'Desconocido';
      
      return {
        success: true,
        data: newMensualidad,
      };
    } catch (error) {
      console.error('Error creating mensualidad:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Update payment
  static async update(id, mensualidadData) {
    try {
      const { data, error } = await supabase
        .from('mensualidades')
        .update({
          ...mensualidadData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, estudiantes(nombres, apellidos)')
        .single();

      if (error) throw error;
      
      // Convert to Mensualidad instance
      const updatedMensualidad = Mensualidad.fromJSON(data);
      updatedMensualidad.estudiante_nombre = data.estudiantes ? 
        `${data.estudiantes.nombres} ${data.estudiantes.apellidos}` : 'Desconocido';
      
      return {
        success: true,
        data: updatedMensualidad,
      };
    } catch (error) {
      console.error('Error updating mensualidad:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Register payment (add to monto_pagado)
  static async registerPayment(id, monto, metodoPago, observaciones = '') {
    try {
      // First get current mensualidad
      const { data: current, error: fetchError } = await supabase
        .from('mensualidades')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const mensualidad = Mensualidad.fromJSON(current);
      
      // Add payment
      mensualidad.monto_pagado += parseFloat(monto);
      mensualidad.metodo_pago = metodoPago;
      mensualidad.observaciones = observaciones;
      
      // Update status
      mensualidad.actualizarEstado();
      
      // If fully paid, set payment date
      if (mensualidad.estado === 'pagado' && !mensualidad.fecha_pago) {
        mensualidad.fecha_pago = new Date();
      }

      // Update in database
      const { data, error } = await supabase
        .from('mensualidades')
        .update({
          monto_pagado: mensualidad.monto_pagado,
          estado: mensualidad.estado,
          metodo_pago: mensualidad.metodo_pago,
          fecha_pago: mensualidad.fecha_pago ? mensualidad.fecha_pago.toISOString() : null,
          observaciones: mensualidad.observaciones,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, estudiantes(nombres, apellidos)')
        .single();

      if (error) throw error;
      
      // Convert to Mensualidad instance
      const result = Mensualidad.fromJSON(data);
      result.estudiante_nombre = data.estudiantes ? 
        `${data.estudiantes.nombres} ${data.estudiantes.apellidos}` : 'Desconocido';
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error registering payment:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Process payment (mark as paid) - DEPRECATED, use registerPayment instead
  static async processPayment(id, metodoPago, numeroRecibo = null) {
    try {
      const { data, error } = await supabase
        .from('mensualidades')
        .update({
          estado: 'pagado',
          fecha_pago: new Date().toISOString(),
          metodo_pago: metodoPago,
          numero_recibo: numeroRecibo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, estudiantes(nombres, apellidos)')
        .single();

      if (error) throw error;
      
      // Convert to Mensualidad instance
      const mensualidad = Mensualidad.fromJSON(data);
      mensualidad.estudiante_nombre = data.estudiantes ? 
        `${data.estudiantes.nombres} ${data.estudiantes.apellidos}` : 'Desconocido';
      
      return {
        success: true,
        data: mensualidad,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Delete payment
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('mensualidades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting mensualidad:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check for missing mensualidades for all active students
  static async checkMissingMensualidades() {
    try {
      // Get all active students with their enrollment date
      const { data: students, error: studentsError } = await supabase
        .from('estudiantes')
        .select('id, nombres, apellidos, fecha_inscripcion, elenco_id, elencos(nombre)')
        .eq('activo', true);

      if (studentsError) throw studentsError;

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      const missingByStudent = [];

      for (const student of students) {
        if (!student.fecha_inscripcion) continue;

        const enrollmentDate = new Date(student.fecha_inscripcion);
        const enrollmentYear = enrollmentDate.getFullYear();
        const enrollmentMonth = enrollmentDate.getMonth() + 1;
        const paymentDay = enrollmentDate.getDate(); // Day of month for payment

        // Get existing mensualidades for this student
        const { data: existing } = await supabase
          .from('mensualidades')
          .select('mes, anio')
          .eq('estudiante_id', student.id);

        const existingSet = new Set(
          existing?.map(m => `${m.anio}-${m.mes}`) || []
        );

        const missing = [];

        // Check from enrollment month to current month
        let checkYear = enrollmentYear;
        let checkMonth = enrollmentMonth;

        while (
          checkYear < currentYear || 
          (checkYear === currentYear && checkMonth <= currentMonth)
        ) {
          const key = `${checkYear}-${checkMonth}`;
          
          if (!existingSet.has(key)) {
            // Calculate due date (same day as enrollment, or last day of month if day doesn't exist)
            const dueDate = new Date(checkYear, checkMonth - 1, paymentDay);
            if (dueDate.getMonth() !== checkMonth - 1) {
              // Day doesn't exist in this month, use last day
              dueDate.setDate(0);
            }

            missing.push({
              mes: checkMonth,
              anio: checkYear,
              fecha_vencimiento: dueDate.toISOString().split('T')[0],
            });
          }

          // Move to next month
          checkMonth++;
          if (checkMonth > 12) {
            checkMonth = 1;
            checkYear++;
          }
        }

        if (missing.length > 0) {
          missingByStudent.push({
            student: {
              id: student.id,
              nombre: `${student.nombres} ${student.apellidos}`,
              elenco: student.elencos?.nombre || 'Sin elenco',
            },
            missing,
          });
        }
      }

      return {
        success: true,
        data: missingByStudent,
      };
    } catch (error) {
      console.error('Error checking missing mensualidades:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Generate missing mensualidades for a student
  static async generateMissingForStudent(studentId, missingMensualidades, montoMensual = 200) {
    try {
      const created = [];

      for (const missing of missingMensualidades) {
        const mensualidad = new Mensualidad({
          estudiante_id: studentId,
          mes: missing.mes,
          anio: missing.anio,
          monto_total: montoMensual, // Use student's monthly amount
          monto_pagado: 0,
          descuento: 0,
          estado: 'pendiente',
          fecha_vencimiento: missing.fecha_vencimiento,
          observaciones: 'Generado automáticamente',
        });

        mensualidad.actualizarEstado();

        const { data, error } = await supabase
          .from('mensualidades')
          .insert([mensualidad.toJSON()])
          .select()
          .single();

        if (error) {
          console.error(`Error creating mensualidad for ${missing.mes}/${missing.anio}:`, error);
          continue;
        }

        created.push(Mensualidad.fromJSON(data));
      }

      return {
        success: true,
        data: created,
      };
    } catch (error) {
      console.error('Error generating mensualidades:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Generate all missing mensualidades for all students
  static async generateAllMissing(missingByStudent) {
    try {
      let totalCreated = 0;

      for (const item of missingByStudent) {
        const result = await this.generateMissingForStudent(
          item.student.id,
          item.missing,
          item.student.monto_mens || 200 // Use student's amount
        );

        if (result.success) {
          totalCreated += result.data.length;
        }
      }

      return {
        success: true,
        totalCreated,
      };
    } catch (error) {
      console.error('Error generating all missing mensualidades:', error);
      return {
        success: false,
        error: error.message,
        totalCreated: 0,
      };
    }
  }
}
