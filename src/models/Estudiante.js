// Estudiante Model (updated to match Supabase schema)
// Represents a student enrolled in the dance academy

export class Estudiante {
  constructor({
    id = null,
    elenco_id = null,
    nombres = '',
    apellidos = '',
    fecha_nacimiento = null,
    ci = '',
    telefono = '',
    email = '',
    nombre_tutor = '',
    telefono_tutor = '',
    email_tutor = '',
    direccion = '',
    fecha_inscripcion = new Date(),
    monto_mens = 200.00, // Monthly payment amount
    activo = true,
    foto_url = null,
    notas = '',
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.id = id;
    this.elenco_id = elenco_id;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.fecha_nacimiento = fecha_nacimiento;
    this.ci = ci;
    this.telefono = telefono;
    this.email = email;
    this.nombre_tutor = nombre_tutor;
    this.telefono_tutor = telefono_tutor;
    this.email_tutor = email_tutor;
    this.direccion = direccion;
    this.fecha_inscripcion = fecha_inscripcion;
    this.monto_mens = monto_mens;
    this.activo = activo;
    this.foto_url = foto_url;
    this.notas = notas;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Get full name
  getNombreCompleto() {
    return `${this.nombres} ${this.apellidos}`.trim();
  }

  // Calculate age
  getEdad() {
    if (!this.fecha_nacimiento) return null;
    const today = new Date();
    const birthDate = new Date(this.fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Validate student data
  validate() {
    const errors = [];
    
    if (!this.nombres || this.nombres.trim().length === 0) {
      errors.push('Nombres son requeridos');
    }
    
    if (!this.apellidos || this.apellidos.trim().length === 0) {
      errors.push('Apellidos son requeridos');
    }
    
    if (!this.telefono_tutor || this.telefono_tutor.trim().length === 0) {
      errors.push('Teléfono del tutor es requerido');
    }
    
    if (!this.elenco_id) {
      errors.push('Debe seleccionar un elenco');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to plain object for storage
  toJSON() {
    const json = {
      elenco_id: this.elenco_id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      fecha_nacimiento: this.fecha_nacimiento ? 
        (typeof this.fecha_nacimiento === 'string' ? this.fecha_nacimiento : this.fecha_nacimiento.toISOString().split('T')[0]) : null,
      ci: this.ci,
      telefono: this.telefono,
      email: this.email,
      nombre_tutor: this.nombre_tutor,
      telefono_tutor: this.telefono_tutor,
      email_tutor: this.email_tutor,
      direccion: this.direccion,
      fecha_inscripcion: this.fecha_inscripcion ? 
        (typeof this.fecha_inscripcion === 'string' ? this.fecha_inscripcion : this.fecha_inscripcion.toISOString().split('T')[0]) : null,
      monto_mens: this.monto_mens,
      activo: this.activo,
      foto_url: this.foto_url,
      notas: this.notas,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString()
    };

    // Only include id if it's not null (for updates)
    if (this.id !== null) {
      json.id = this.id;
    }

    return json;
  }

  // Create from plain object (from Supabase)
  static fromJSON(json) {
    return new Estudiante({
      ...json,
      fecha_nacimiento: json.fecha_nacimiento ? new Date(json.fecha_nacimiento) : null,
      fecha_inscripcion: json.fecha_inscripcion ? new Date(json.fecha_inscripcion) : new Date(),
      created_at: new Date(json.created_at),
      updated_at: new Date(json.updated_at)
    });
  }
}
