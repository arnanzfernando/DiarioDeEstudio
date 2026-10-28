# Diario de Estudio

Una aplicación web estática, ligera y *responsive* diseñada para registrar sesiones de estudio diarias, hacer seguimiento del progreso visual mediante un mapa de calor y mantener la motivación a través de rachas y objetivos mensuales.

---

## 🚀 Características Principales

- **Registro de Sesiones:** Formulario intuitivo para añadir, editar y eliminar sesiones de estudio (fecha, tema y duración en minutos).
- **Métricas y Rachas:**
  - 🔥 **Racha actual:** Conteo de días consecutivos estudiando (mantenida viva si estudiaste ayer).
  - 🏆 **Mejor racha:** Récord histórico calculado en tiempo real sobre las sesiones guardadas.
  - ⏱️ **Minutos del mes:** Total acumulado de minutos estudiados en el mes en curso.
  - 📅 **Días del mes:** Días únicos con actividad de estudio en el mes actual.
- **🎯 Objetivo Mensual y Celebración:**
  - Configuración de meta mensual ajustable en minutos.
  - Tarjeta de objetivo con progreso en tiempo real.
  - Celebración con modal accesible al alcanzar o superar la meta fijada.
- **📊 Mapa de Calor Interactivo:**
  - Visualización de las últimas 12 semanas organizadas en cintas semanales (lunes a domingo).
  - Escala visual de 4 niveles en gama naranja basada en la intensidad del estudio.
  - Detalle emergente de minutos y fechas al pasar el cursor, enfocar o tocar cada celda.
- **🌙 Tema Claro y Oscuro:**
  - Detección automática de las preferencias del sistema.
  - Selector manual con persistencia en el navegador (carbón cálido para el modo oscuro).
- **🔒 Privacidad y Almacenamiento Local:** Todos los datos se guardan exclusivamente en el `localStorage` del navegador. Sin backend, sin registros ni servidores externos.

---

## 🛠️ Stack Tecnológico y Arquitectura

El proyecto está construido bajo una filosofía de simplicidad absoluta y cero dependencias:

- **Frontend:** HTML5 semántico, CSS3 puro (variables CSS, CSS Grid, Flexbox, diseño fluido con `clamp()`) y JavaScript ES6 Vanilla.
- **Lógica Desacoplada (`logica.js`):** Funciones puras independientes del DOM y de `localStorage` para el cálculo de rachas, mapa de calor, fechas y objetivos.
- **Integración e Interfaz (`app.js`):** Gestión del estado de la interfaz, eventos de DOM y persistencia de datos.
- **Manejo de Fechas:** Fechas procesadas en hora local para evitar desajustes por zonas horarias (UTC).

---

## 📁 Estructura del Proyecto

```text
.
├── index.html        # Estructura principal y marcado semántico
├── styles.css        # Hoja de estilos (diseño responsive, tokens de color y temas)
├── logica.js         # Funciones puras (cálculos de rachas, fechas, mapa de calor y metas)
├── app.js            # Control del DOM, eventos, estado de la interfaz y localStorage
└── tests/            # Pruebas unitarias nativas para la lógica del sistema
    ├── mapa.test.js
    ├── objetivo.test.js
    └── sesiones.test.js
