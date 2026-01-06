# DanzApp

Aplicación móvil para la gestión de una academia de danza, desarrollada con React Native y Expo.

## 🎯 Características

- **Gestión de Elencos**: Crear y administrar grupos de danza
- **Control de Asistencia**: Registro diario de asistencia por elenco
- **Gestión de Estudiantes**: Registro completo de estudiantes con información de contacto
- **Sistema de Pagos**:
  - Registro de mensualidades automáticas
  - Seguimiento de pagos (completos, parciales, vencidos)
  - Generación automática de mensualidades al inscribir estudiantes
- **Historial de Asistencia**: Visualización de asistencias pasadas

## 🛠️ Tecnologías

- **React Native** con Expo
- **Supabase** (Backend y Base de Datos)
- **React Navigation** para navegación
- **Expo Vector Icons** para iconografía

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/TU_USUARIO/DanzApp.git
cd DanzApp
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura Supabase:

   - Crea un proyecto en [Supabase](https://supabase.com)
   - Copia las credenciales a `src/config/supabase.js`

4. Inicia la aplicación:

```bash
npx expo start
```

## 📱 Uso

- Escanea el código QR con la app Expo Go en tu dispositivo móvil
- O presiona `a` para Android emulator, `i` para iOS simulator

## 🗂️ Estructura del Proyecto

```
DanzApp/
├── src/
│   ├── config/          # Configuración (Supabase)
│   ├── models/          # Modelos de datos
│   ├── services/        # Servicios de API
│   ├── views/
│   │   ├── components/  # Componentes reutilizables
│   │   └── screens/     # Pantallas de la app
│   ├── navigation/      # Configuración de navegación
│   └── theme/           # Temas y estilos
├── App.js
└── package.json
```

## 🔐 Seguridad

**IMPORTANTE**: No subas tus credenciales de Supabase al repositorio. Usa variables de entorno o archivos de configuración local.

## 📄 Licencia

Este proyecto es de uso privado para la academia de danza.

## 👤 Autor

Desarrollado por [Tu Nombre]
