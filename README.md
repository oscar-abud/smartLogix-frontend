# SmartLogix Frontend

Interfaz web para el sistema SmartLogix, construida con React + TypeScript + Vite.

## Stack

- **React 19** + **TypeScript**
- **Bootstrap 5** — estilos y componentes UI
- **Axios** — cliente HTTP
- **Zustand** — manejo de estado global
- **Sonner** — notificaciones (toasts)
- **React Router DOM** — enrutamiento
- **Vitest** + **Testing Library** — pruebas unitarias

---

## Instalación

```bash
npm install
```

---

## Ejecución

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Pruebas

### Ejecutar tests

```bash
npm run test
```

### Generar reporte de cobertura

```bash
npm run test:coverage
```

El reporte se genera en consola (texto) y en `coverage/index.html` (HTML navegable).

> Se requiere al menos **60% de cobertura** para aprobar.

---

## Build para producción

```bash
npm run build
```
