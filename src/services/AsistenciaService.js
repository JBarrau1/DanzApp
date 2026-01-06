// Asistencia Service
// Service layer for asistencia (attendance) database operations

import { supabase } from '../config/supabase';
import { Asistencia } from '../models/Asistencia';

export class AsistenciaService {
  // Get all attendance records
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select('*, estudiantes(nombres, apellidos), elencos(nombre)')
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Convert to Asistencia instances
      const asistencias = data.map(item => {
        const asistencia = Asistencia.fromJSON(item);
        asistencia.estudiante_nombre = item.estudiantes ? 
          `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'Desconocido';
        asistencia.elenco_nombre = item.elencos?.nombre || 'Sin elenco';
        return asistencia;
      });
      
      return {
        success: true,
        data: asistencias,
      };
    } catch (error) {
      console.error('Error fetching asistencias:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get attendance by date
  static async getByDate(date) {
    try {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('asistencias')
        .select('*, estudiantes(nombres, apellidos), elencos(nombre)')
        .eq('fecha', dateStr)
        .order('estudiantes(apellidos)', { ascending: true });

      if (error) throw error;
      
      // Convert to Asistencia instances
      const asistencias = data.map(item => {
        const asistencia = Asistencia.fromJSON(item);
        asistencia.estudiante_nombre = item.estudiantes ? 
          `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'Desconocido';
        asistencia.elenco_nombre = item.elencos?.nombre || 'Sin elenco';
        return asistencia;
      });
      
      return {
        success: true,
        data: asistencias,
      };
    } catch (error) {
      console.error('Error fetching asistencias by date:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get attendance by student
  static async getByStudent(estudianteId) {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select('*, elencos(nombre)')
        .eq('estudiante_id', estudianteId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Convert to Asistencia instances
      const asistencias = data.map(item => {
        const asistencia = Asistencia.fromJSON(item);
        asistencia.elenco_nombre = item.elencos?.nombre || 'Sin elenco';
        return asistencia;
      });
      
      return {
        success: true,
        data: asistencias,
      };
    } catch (error) {
      console.error('Error fetching asistencias by student:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get today's attendance summary
  static async getTodaySummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('asistencias')
        .select('estado')
        .eq('fecha', today);

      if (error) throw error;

      const summary = {
        total: data.length,
        presente: data.filter(a => a.estado === 'presente').length,
        tardanza: data.filter(a => a.estado === 'tardanza').length,
        ausente: data.filter(a => a.estado === 'ausente').length,
        justificado: data.filter(a => a.estado === 'justificado').length,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error('Error fetching today summary:', error);
      return {
        success: false,
        error: error.message,
        data: {
          total: 0,
          presente: 0,
          tardanza: 0,
          ausente: 0,
          justificado: 0,
        },
      };
    }
  }

  // Record attendance
  static async create(asistenciaData) {
    try {
      console.log('📥 AsistenciaService.create received:', asistenciaData);
      
      const asistencia = new Asistencia(asistenciaData);
      const validation = asistencia.validate();
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          data: null,
        };
      }

      const jsonData = asistencia.toJSON();
      console.log('📤 Sending to Supabase:', jsonData);

      const { data, error } = await supabase
        .from('asistencias')
        .insert([jsonData])
        .select('*, estudiantes(nombres, apellidos), elencos(nombre)')
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Supabase response:', data);
      
      // Convert to Asistencia instance
      const newAsistencia = Asistencia.fromJSON(data);
      newAsistencia.estudiante_nombre = data.estudiantes ? 
        `${data.estudiantes.nombres} ${data.estudiantes.apellidos}` : 'Desconocido';
      newAsistencia.elenco_nombre = data.elencos?.nombre || 'Sin elenco';
      
      return {
        success: true,
        data: newAsistencia,
      };
    } catch (error) {
      console.error('Error creating asistencia:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Update attendance
  static async update(id, asistenciaData) {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .update(asistenciaData)
        .eq('id', id)
        .select('*, estudiantes(nombres, apellidos), elencos(nombre)')
        .single();

      if (error) throw error;
      
      // Convert to Asistencia instance
      const updatedAsistencia = Asistencia.fromJSON(data);
      updatedAsistencia.estudiante_nombre = data.estudiantes ? 
        `${data.estudiantes.nombres} ${data.estudiantes.apellidos}` : 'Desconocido';
      updatedAsistencia.elenco_nombre = data.elencos?.nombre || 'Sin elenco';
      
      return {
        success: true,
        data: updatedAsistencia,
      };
    } catch (error) {
      console.error('Error updating asistencia:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Delete attendance
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('asistencias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting asistencia:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
