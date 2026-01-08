# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

- Mobile app for managing a dance academy (elencos, students, attendance, monthly payments).
- Built with React Native and Expo, using React Navigation for navigation and Supabase as backend/database.
- Primary documentation is in `README.md` (features, installation with `npm install`, and running via `npx expo start`).

## Common commands

All commands below are intended to be run from the project root.

### Development server

- Install dependencies:
  - `npm install`
- Start Expo dev server (as in `README.md`):
  - `npx expo start`
- Convenience `npm` scripts (from `package.json`):
  - `npm run start` – alias for `expo start`.
  - `npm run android` – start Expo targeting Android.
  - `npm run ios` – start Expo targeting iOS.
  - `npm run web` – start Expo in web mode.

### Build, lint, and tests

- There are currently **no dedicated npm scripts** for building native binaries, linting, or running tests.
- Native builds (APK/IPA) and EAS workflows should be run using standard Expo tooling in your environment; this repository does not define custom build scripts.
- Automated tests are **not yet configured** (no Jest/Vitest config or test scripts). There is no way to run a "single test" without first introducing a test framework and scripts.

## Supabase and configuration

- Supabase client is configured in `src/config/supabase.js` using `@supabase/supabase-js`.
- Treat Supabase URL and keys as secrets. If you need to change them, prefer environment-specific configuration (e.g., using env vars or untracked local files) and avoid committing real credentials.
- Most data access in the app goes through this client; changes to Supabase schema usually require updating the corresponding model and service (see below).

## High-level architecture

The codebase is organized around a simple domain-layered structure: **models → services → controllers → views**, with navigation and theming as cross-cutting concerns.

### Entry point and navigation flow

- `index.js` registers the React Native root component with Expo and renders `App`.
- `App.js` sets up high-level providers:
  - `SafeAreaProvider` from `react-native-safe-area-context`.
  - `NavigationContainer` from `@react-navigation/native`.
  - `StatusBar` from `expo-status-bar`.
  - Renders the `RootNavigator`.
- `src/navigation/RootNavigator.js`:
  - Stack navigator (`createStackNavigator`) that:
    - Uses `getTheme` from `src/theme` with `useColorScheme()` to choose light/dark colors.
    - Hides headers and applies themed background to the card style.
    - Declares routes:
      - `MainTabs` → `BottomTabNavigator`.
      - Detail/flow screens: `ElencoDetail`, `AddElenco`, `TakeAttendance`, `AttendanceHistory`, `StudentPayment`, `AddStudent`.
- `src/navigation/BottomTabNavigator.js`:
  - Bottom tab navigator (`createBottomTabNavigator`) with a custom floating tab bar (`CustomTabBar`).
  - Tabs map to the main feature areas:
    - `Home` → `HomeScreen` (dashboard).
    - `Asistencia` → `AttendanceScreen` (attendance workflows).
    - `Mensualidades` → `PaymentScreen` (payment workflows).

When adding new screens, follow this pattern:
1. Create the screen component under `src/views/screens/`.
2. Add it to the appropriate navigator (`RootNavigator` for stack, `BottomTabNavigator` for tabs) with a clear route name.

### Domain models (`src/models`)

Models encapsulate business entities and domain logic, usually mirroring Supabase tables:

- `Estudiante` (students):
  - Fields such as `elenco_id`, names, contact info, enrollment data, monthly amount (`monto_mens`), and flags like `activo`.
  - Methods for derived data and validation:
    - `getNombreCompleto()` combines first and last names.
    - `getEdad()` calculates age from `fecha_nacimiento`.
    - `validate()` returns `isValid` plus a list of human-readable validation errors.
    - `toJSON()` normalizes dates and shapes data for Supabase inserts/updates.
    - `static fromJSON()` converts Supabase rows to model instances with proper `Date` objects.
- `Mensualidad` (monthly payments):
  - Tracks `estudiante_id`, `mes`, `anio`, amounts, discounts, status (`pendiente`, `pagado`, `parcial`, `vencido`), and due/payment dates.
  - Business helpers:
    - `getMesNombre()` and `getPeriodoDisplay()` for UI labels (e.g., "Enero 2026").
    - `getMontoRestante()`, `isVencido()`, and `actualizarEstado()` encapsulate payment-status logic.
    - `validate()`, `toJSON()`, and `fromJSON()` mirror the Estudiante pattern.

Other models (e.g., `Asistencia`, `Elenco`, `Attendance`, `Payment`) follow the same pattern: encapsulate validation, derived fields, and JSON transformation so that services and views do not need to know Supabase’s raw schema.

### Service layer (`src/services`)

Services are the main integration point with Supabase and should be the default place for data access and persistence logic.

- `EstudianteService`:
  - Query helpers:
    - `getAll()`, `getActive()`, `getByElenco(elencoId)`, `getById(id)` – join with `elencos` to attach `elenco_nombre` to model instances.
    - `getCount()` and `getActiveCount()` – return counts for dashboard statistics.
  - Mutation helpers:
    - `create(estudianteData)` – validates via `Estudiante.validate()`, inserts into `estudiantes`, and returns a hydrated `Estudiante` with `elenco_nombre`.
    - `update(id, estudianteData)` and `delete(id)` – update or hard-delete in Supabase.
  - Enrollment + payments:
    - `createWithMensualidades(estudianteData)` – creates a student and auto-generates historical mensualidades from enrollment month up to the current month using `MensualidadService.generateMissingForStudent`.
- `MensualidadService`:
  - Query helpers around the `mensualidades` table:
    - `getAll()`, `getByStatus(estado)`, `getOverdue()`, `getByStudent(estudianteId)` – attach student names and sometimes elenco info for UI.
    - `getStatistics()` – aggregates counts and monetary sums by status (used by `HomeController` for dashboard stats).
  - Mutation helpers:
    - `create(mensualidadData)` and `update(id, mensualidadData)` – enforce validation and `actualizarEstado()` before persisting.
    - `registerPayment(id, monto, metodoPago, observaciones)` – incremental payments: updates `monto_pagado`, recalculates status, sets `fecha_pago` when fully paid.
    - `delete(id)` – removes a mensualidad.
  - Missing mensualidades workflows:
    - `checkMissingMensualidades()` – for each active student, inspects existing mensualidades and computes which months/years are missing up to the current month.
    - `generateMissingForStudent(studentId, missingMensualidades, montoMensual)` – creates mensualidades for missing periods.
    - `generateAllMissing(missingByStudent)` – bulk-generates for multiple students.
- `AsistenciaService`:
  - Query helpers:
    - `getAll()`, `getByDate(date)`, `getByStudent(estudianteId)` – join with students and elencos and return `Asistencia` instances with derived display fields.
    - `getTodaySummary()` – returns counts of `presente`, `tardanza`, `ausente`, `justificado` for today’s date, used on the home dashboard.
  - Mutation helpers:
    - `create(asistenciaData)` – validates using the `Asistencia` model, inserts into `asistencias`, and returns a hydrated instance.
    - `update(id, asistenciaData)` and `delete(id)` – update/remove an attendance record.

When changing Supabase schema, update the relevant **model first**, then adjust queries and mapping logic in the corresponding **service**.

### Controllers (`src/controllers`)

Controllers orchestrate multiple services for a specific screen or workflow and expose simplified methods for the views.

- `HomeController`:
  - `getStatistics()` – uses `EstudianteService.getCount()`, `EstudianteService.getActiveCount()`, `AsistenciaService.getTodaySummary()`, and `MensualidadService.getStatistics()` to assemble a single stats object consumed by `HomeScreen`.
  - `getRecentActivities()` – combines recent attendance and payment events into a unified activity feed for the dashboard.
- Other controllers (e.g., `AttendanceController`, `PaymentController`) follow the same idea: gather and transform data from services and expose convenient methods for their corresponding screens.

If you need new screen-level behaviors (e.g., combined queries, multi-step flows), prefer adding them to the appropriate controller so that views remain mostly declarative.

### Views and components (`src/views`)

UI is split between **screens** and **reusable components**.

- `src/views/screens` – top-level screens like `HomeScreen`, `AttendanceScreen`, `PaymentScreen`, `AddStudentScreen`, etc. Typical pattern:
  - Use `useColorScheme()` + `getTheme()` for theming.
  - Instantiate a controller and call its async methods in `useEffect` to load data (`HomeScreen` is a good reference).
  - Manage loading/error state and render domain-specific components.
- `src/views/components` – shared components such as `Card`, `StatCard`, `ElencoCard`, modals for mensualidades and payments, schedule pickers, etc.
  - `Card.js` shows the component pattern: reads theme via `getTheme`, applies spacing, border radius, and shadow from the theme, and wraps `children`.

When adding new UI pieces, try to keep domain logic in controllers/services and limit screens/components to presentation and basic state handling.

### Theming (`src/theme`)

- `src/theme/index.js` exports:
  - `typography`, `spacing`, `borderRadius`, `shadows` – design tokens shared across the app.
  - `getTheme(isDark)` – returns a theme object with either `lightColors` or `darkColors` from `src/theme/colors.js` plus the tokens above.
- Components typically:
  - Use `useColorScheme()` to determine whether the device is in dark mode.
  - Call `getTheme(colorScheme === 'dark')` and use `theme.colors`, `theme.typography`, etc.

When styling new components or screens, prefer pulling values from `getTheme` instead of hardcoding colors or font sizes.
