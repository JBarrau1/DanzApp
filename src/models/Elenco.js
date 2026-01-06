// Elenco Model
// Represents a dance group/class (Juvenil A, Infantil B, etc.)

export class Elenco {
  constructor({
    id = null,
    nombre = '',
    descripcion = '',
    edad_minima = null,
    edad_maxima = null,
    horario = '',
    activo = true,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.edad_minima = edad_minima;
    this.edad_maxima = edad_maxima;
    this.horario = horario;
    this.activo = activo;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Validate elenco data
  validate() {
    const errors = [];
    
    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('Nombre es requerido');
    }
    
    if (this.edad_minima && this.edad_maxima && this.edad_minima > this.edad_maxima) {
      errors.push('Edad mínima no puede ser mayor que edad máxima');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to plain object for storage
  toJSON() {
    const json = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      horario: this.horario,
      edad_minima: this.edad_minima,
      edad_maxima: this.edad_maxima,
      activo: this.activo,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString()
    };

    // Only include id if it exists (for updates)
    if (this.id !== null) {
      json.id = this.id;
    }

    return json;
  }

  // Create from plain object (from Supabase)
  static fromJSON(json) {
    return new Elenco({
      ...json,
      created_at: new Date(json.created_at),
      updated_at: new Date(json.updated_at)
    });
  }

  // Get age range display
  getAgeRangeDisplay() {
    if (this.edad_minima && this.edad_maxima) {
      return `${this.edad_minima}-${this.edad_maxima} años`;
    } else if (this.edad_minima) {
      return `${this.edad_minima}+ años`;
    } else if (this.edad_maxima) {
      return `Hasta ${this.edad_maxima} años`;
    }
    return 'Todas las edades';
  }
}
