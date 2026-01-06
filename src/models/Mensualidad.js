// Mensualidad Model (updated to match Supabase schema)
// Represents a monthly payment record for student tuition

export class Mensualidad {
  constructor({
    id = null,
    estudiante_id = null,
    mes = new Date().getMonth() + 1, // 1-12
    anio = new Date().getFullYear(),
    monto_total = 0,
    monto_pagado = 0,
    descuento = 0,
    estado = 'pendiente', // 'pendiente', 'pagado', 'parcial', 'vencido'
    fecha_vencimiento = null,
    fecha_pago = null,
    metodo_pago = null, // 'efectivo', 'transferencia', 'qr'
    numero_recibo = '',
    observaciones = '',
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.id = id;
    this.estudiante_id = estudiante_id;
    this.mes = mes;
    this.anio = anio;
    this.monto_total = monto_total;
    this.monto_pagado = monto_pagado;
    this.descuento = descuento;
    this.estado = estado;
    this.fecha_vencimiento = fecha_vencimiento;
    this.fecha_pago = fecha_pago;
    this.metodo_pago = metodo_pago;
    this.numero_recibo = numero_recibo;
    this.observaciones = observaciones;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Get month name in Spanish
  getMesNombre() {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[this.mes - 1] || '';
  }

  // Get period display (e.g., "Enero 2026")
  getPeriodoDisplay() {
    return `${this.getMesNombre()} ${this.anio}`;
  }

  // Calculate remaining amount
  getMontoRestante() {
    return this.monto_total - this.descuento - this.monto_pagado;
  }

  // Check if payment is overdue
  isVencido() {
    if (this.estado === 'pagado') return false;
    if (!this.fecha_vencimiento) return false;
    return new Date() > new Date(this.fecha_vencimiento);
  }

  // Update status based on payment and dates
  actualizarEstado() {
    const restante = this.getMontoRestante();
    
    if (restante <= 0) {
      this.estado = 'pagado';
    } else if (this.monto_pagado > 0) {
      this.estado = 'parcial';
    } else if (this.isVencido()) {
      this.estado = 'vencido';
    } else {
      this.estado = 'pendiente';
    }
  }

  // Validate payment data
  validate() {
    const errors = [];
    
    if (!this.estudiante_id) {
      errors.push('ID de estudiante es requerido');
    }
    
    if (!this.mes || this.mes < 1 || this.mes > 12) {
      errors.push('Mes debe estar entre 1 y 12');
    }
    
    if (!this.anio || this.anio < 2020) {
      errors.push('Año inválido');
    }
    
    if (!this.monto_total || this.monto_total <= 0) {
      errors.push('Monto total debe ser mayor a 0');
    }
    
    if (!this.fecha_vencimiento) {
      errors.push('Fecha de vencimiento es requerida');
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
      mes: this.mes,
      anio: this.anio,
      monto_total: this.monto_total,
      monto_pagado: this.monto_pagado,
      descuento: this.descuento,
      estado: this.estado,
      fecha_vencimiento: this.fecha_vencimiento ? 
        (typeof this.fecha_vencimiento === 'string' ? this.fecha_vencimiento : this.fecha_vencimiento.toISOString().split('T')[0]) : null,
      fecha_pago: this.fecha_pago ? this.fecha_pago.toISOString() : null,
      metodo_pago: this.metodo_pago,
      numero_recibo: this.numero_recibo,
      observaciones: this.observaciones,
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
    return new Mensualidad({
      ...json,
      fecha_vencimiento: json.fecha_vencimiento ? new Date(json.fecha_vencimiento) : null,
      fecha_pago: json.fecha_pago ? new Date(json.fecha_pago) : null,
      created_at: new Date(json.created_at),
      updated_at: new Date(json.updated_at)
    });
  }

  // Get status color for UI
  getStatusColor() {
    switch (this.estado) {
      case 'pagado':
        return '#4CAF50';
      case 'pendiente':
        return '#FF9800';
      case 'vencido':
        return '#F44336';
      case 'parcial':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  }

  // Get status display text
  getStatusText() {
    switch (this.estado) {
      case 'pagado':
        return 'Pagado';
      case 'pendiente':
        return 'Pendiente';
      case 'vencido':
        return 'Vencido';
      case 'parcial':
        return 'Parcial';
      default:
        return this.estado;
    }
  }
}
