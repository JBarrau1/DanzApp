// Elenco Service
// Service layer for elenco (dance group) database operations

import { supabase } from '../config/supabase';
import { Elenco } from '../models/Elenco';

export class ElencoService {
  // Get all elencos
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('elencos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return {
        success: true,
        data: data.map(item => Elenco.fromJSON(item)),
      };
    } catch (error) {
      console.error('Error fetching elencos:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get active elencos only
  static async getActive() {
    try {
      console.log('🔍 ElencoService: Fetching active elencos...');
      const { data, error } = await supabase
        .from('elencos')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Found elencos:', data?.length || 0);
      return {
        success: true,
        data: data.map(item => Elenco.fromJSON(item)),
      };
    } catch (error) {
      console.error('❌ Error fetching active elencos:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Get elenco by ID
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('elencos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        success: true,
        data: Elenco.fromJSON(data),
      };
    } catch (error) {
      console.error('Error fetching elenco:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Create new elenco
  static async create(elencoData) {
    try {
      const elenco = new Elenco(elencoData);
      const validation = elenco.validate();
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          data: null,
        };
      }

      const { data, error } = await supabase
        .from('elencos')
        .insert([elenco.toJSON()])
        .select()
        .single();

      if (error) throw error;
      return {
        success: true,
        data: Elenco.fromJSON(data),
      };
    } catch (error) {
      console.error('Error creating elenco:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Update elenco
  static async update(id, elencoData) {
    try {
      const { data, error } = await supabase
        .from('elencos')
        .update({
          ...elencoData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        success: true,
        data: Elenco.fromJSON(data),
      };
    } catch (error) {
      console.error('Error updating elenco:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Delete elenco
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('elencos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting elenco:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
