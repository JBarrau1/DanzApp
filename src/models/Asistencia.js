// Asistencia Model (updated to match Supabase schema)
// Represents an attendance record for a student

export class Asistencia {
  constructor({
    id = null,
    estudiante_id = null,
    elenco_id = null,
    fecha = new Date(),
    hora_inicio = null,
    hora_fin = null,
    estado = 'presente', // 'presente', 'ausente', 'tardanza', 'justificado'
    observaciones = '',
    created_at = new Date()
  }) {
    this.id = id;
    this.estudiante_id = estudiante_id;
    this.elenco_id = elenco_id;
    this.fecha = fecha;
    this.hora_inicio = hora_inicio;
    this.hora_fin = hora_fin;
    this.estado = estado;
    this.observaciones = observaciones;
    this.created_at = created_at;
  }

  // Validate attendance data
  validate() {
    const errors = [];
    
    if (!this.estudiante_id) {
      errors.push('ID de estudiante es requerido');
    }
    
    if (!this.elenco_id) {
      errors.push('ID de elenco es requerido');
    }
    
    if (!this.fecha) {
      errors.push('Fecha es requerida');
    }
    
    const validEstados = ['presente', 'ausente', 'tardanza', 'justificado'];
    if (!validEstados.includes(this.estado)) {
      errors.push('Estado de asistencia inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to plain object for storage
  toJSON() {
    const json = {
      estudiante_id: this.estudiante_id,
      elenco_id: this.elenco_id,
      fecha: typeof this.fecha === 'string' ? this.fecha : this.fecha.toISOString().split('T')[0],
      hora_inicio: this.hora_inicio,
      hora_fin: this.hora_fin,
      estado: this.estado,
      observaciones: this.observaciones,
      created_at: this.created_at.toISOString()
    };

    // Only include id if it exists (for updates)
    if (this.id !== null) {
      json.id = this.id;
    }

    return json;
  }

  // Create from plain object (from Supabase)
  static fromJSON(json) {
    return new Asistencia({
      ...json,
      fecha: new Date(json.fecha),
      created_at: new Date(json.created_at)
    });
  }

  // Get status color for UI
  getStatusColor() {
    switch (this.estado) {
      case 'presente':
        return '#4CAF50';
      case 'tardanza':
        return '#FF9800';
      case 'ausente':
        return '#F44336';
      case 'justificado':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  }

  // Get status display text
  getStatusText() {
    switch (this.estado) {
      case 'presente':
        return 'Presente';
      case 'tardanza':
        return 'Tardanza';
      case 'ausente':
        return 'Ausente';
      case 'justificado':
        return 'Justificado';
      default:
        return this.estado;
    }
  }
}
