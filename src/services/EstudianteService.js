// Estudiante Service
// Service layer for estudiante (student) database operations

import { supabase } from '../config/supabase';
import { Estudiante } from '../models/Estudiante';

export class EstudianteService {
  // Get all students
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*, elencos(nombre)')
        .order('apellidos', { ascending: true });

      if (error) throw error;
      
      const students = data.map(item => {
        const student = Estudiante.fromJSON(item);
        student.elenco_nombre = item.elencos?.nombre || 'Sin elenco';
        return student;
      });
      
      return {
        success: true,
        data: students,
      };
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get active students only
  static async getActive() {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*, elencos(nombre)')
        .eq('activo', true)
        .order('apellidos', { ascending: true });

      if (error) throw error;
      return {
        success: true,
        data: data.map(item => ({
          ...Estudiante.fromJSON(item),
          elenco_nombre: item.elencos?.nombre || 'Sin elenco',
        })),
      };
    } catch (error) {
      console.error('Error fetching active estudiantes:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get students by elenco
  static async getByElenco(elencoId) {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*, elencos(nombre)')
        .eq('elenco_id', elencoId)
        .eq('activo', true)
        .order('apellidos', { ascending: true });

      if (error) throw error;
      
      const students = data.map(item => {
        const student = Estudiante.fromJSON(item);
        student.elenco_nombre = item.elencos?.nombre || 'Sin elenco';
        return student;
      });
      
      return {
        success: true,
        data: students,
      };
    } catch (error) {
      console.error('Error fetching estudiantes by elenco:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get student by ID
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*, elencos(nombre)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const student = Estudiante.fromJSON(data);
      student.elenco_nombre = data.elencos?.nombre || 'Sin elenco';
      
      return {
        success: true,
        data: student,
      };
    } catch (error) {
      console.error('Error fetching estudiante:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Create new student
  static async create(estudianteData) {
    try {
      const estudiante = new Estudiante(estudianteData);
      const validation = estudiante.validate();
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          data: null,
        };
      }

      const { data, error } = await supabase
        .from('estudiantes')
        .insert([estudiante.toJSON()])
        .select('*, elencos(nombre)')
        .single();

      if (error) throw error;
      return {
        success: true,
        data: {
          ...Estudiante.fromJSON(data),
          elenco_nombre: data.elencos?.nombre || 'Sin elenco',
        },
      };
    } catch (error) {
      console.error('Error creating estudiante:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Update student
  static async update(id, estudianteData) {
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .update({
          ...estudianteData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, elencos(nombre)')
        .single();

      if (error) throw error;
      
      const student = Estudiante.fromJSON(data);
      student.elenco_nombre = data.elencos?.nombre || 'Sin elenco';
      
      return {
        success: true,
        data: student,
      };
    } catch (error) {
      console.error('Error updating estudiante:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Delete student
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting estudiante:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get student count
  static async getCount() {
    try {
      const { count, error } = await supabase
        .from('estudiantes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return {
        success: true,
        count,
      };
    } catch (error) {
      console.error('Error getting student count:', error);
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  }

  // Get active student count
  static async getActiveCount() {
    try {
      const { count, error } = await supabase
        .from('estudiantes')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

      if (error) throw error;
      return {
        success: true,
        count,
      };
    } catch (error) {
      console.error('Error getting active student count:', error);
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  }

  // Create student with automatic mensualidad generation
static async createWithMensualidades(estudianteData) {
  try {
    const { MensualidadService } = require('./MensualidadService');
    const student = new Estudiante(estudianteData);
    const validation = student.validate();
    if (!validation.isValid) return { success: false, error: validation.errors.join(', '), data: null };

    const { data: studentData, error: studentError } = await supabase
      .from('estudiantes').insert([student.toJSON()]).select('*, elencos(nombre)').single();
    if (studentError) throw studentError;

    const createdStudent = Estudiante.fromJSON(studentData);
    createdStudent.elenco_nombre = studentData.elencos?.nombre || 'Sin elenco';

    const enrollmentDate = new Date(createdStudent.fecha_inscripcion);
    const today = new Date();
    const paymentDay = enrollmentDate.getDate();
    const mensualidadesToCreate = [];
    let checkYear = enrollmentDate.getFullYear();
    let checkMonth = enrollmentDate.getMonth() + 1;

    while (checkYear < today.getFullYear() || (checkYear === today.getFullYear() && checkMonth <= today.getMonth() + 1)) {
      const dueDate = new Date(checkYear, checkMonth - 1, paymentDay);
      if (dueDate.getMonth() !== checkMonth - 1) dueDate.setDate(0);
      mensualidadesToCreate.push({ mes: checkMonth, anio: checkYear, fecha_vencimiento: dueDate.toISOString().split('T')[0] });
      checkMonth++; if (checkMonth > 12) { checkMonth = 1; checkYear++; }
    }

    const mensualidadesResult = await MensualidadService.generateMissingForStudent(
      createdStudent.id, mensualidadesToCreate, createdStudent.monto_mens
    );

    return { success: true, data: { student: createdStudent, mensualidadesCreated: mensualidadesResult.data?.length || 0 } };
  } catch (error) {
    console.error('Error creating estudiante with mensualidades:', error);
    return { success: false, error: error.message, data: null };
  }
}
}
