# AGENTS.md — Diario de Estudio

Web estática para registrar sesiones de estudio y motivarse viendo la racha de días seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a programar.

## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos). En la carpeta están además `.idea/` (lo genera IntelliJ), `MEMORY.md`, `opencode.json` (config de OpenCode), `.opencode/` (comandos), `.agents/` (skills copiadas, con `local-dates`) y este `AGENTS.md`: no son parte de la web, no los borres.
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES (`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.

## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Código nuevo (funciones, identificadores, comentarios) en inglés; el existente se deja en español: no renombres solo por el idioma (decisión 12 de la spec 001, ratificada el 2026-10-03).
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos
- localStorage, clave `diario-estudio-sesiones`: array de `{ fecha, tema, minutos, creadaEn }`.
  - `fecha`: `"AAAA-MM-DD"`. `minutos`: número entero ≥ 1. `creadaEn`: marca de tiempo que solo sirve para ordenar las sesiones del mismo día.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario perderá sus sesiones.

## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- **Mejor racha**: tramo más largo de todo el historial. Se calcula **siempre** de las sesiones guardadas y nunca se guarda como valor aparte (por eso el formato de los datos no cambia). Mismo criterio que la actual: fecha local, un día cuenta una vez, lo futuro no suma, y las fechas con formato inválido se ignoran sin cortar nada.
- Solo la racha actual aplica la regla de "si hoy no hay sesión pero ayer sí, sigue viva": la mejor es histórica e **incluye la racha en curso** (si hoy llevas 5, la mejor es ≥ 5).
- **Minutos del mes**: total de minutos de las sesiones del **mes en curso** (comparando el prefijo `AAAA-MM` del texto de fecha, nunca con aritmética de fechas). No cuentan las fechas de otros meses ni las futuras, ni los minutos que no sean un número > 0; todas las sesiones de un mismo día suman.
- **Días del mes**: días distintos con sesión del **mes en curso** (comparando el prefijo `AAAA-MM` del texto de fecha, nunca con aritmética de fechas). Un mismo día cuenta una sola vez y las fechas futuras de este mes no suman. Los minutos de la sesión **no importan**: lo que marca el día es que exista.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.

## Verificación
- Tests de la lógica: `node --test` (pruebas en `tests/`). Después de cada cambio, ejecútalos y verifica además con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
- Comprobación rápida de sintaxis: `node --check app.js` (exit 0 = correcto).
- Casos de racha que deben seguir valiendo: sin datos → 0 y 0; dos sesiones el mismo día → 1 y 1; un hueco → se queda la racha mayor; racha en curso ≥ mejor racha; una fecha futura y una fecha con formato inválido no cuentan.
- Casos de minutos del mes: las del mes pasado no cuentan —aunque sea del año anterior—, las de este mes sí, una futura de este mes no suma, los minutos inválidos no suman y un mismo día suma todo.
- Casos de días del mes: un mismo día repetido cuenta 1; el mes pasado (aunque sea del año anterior) no cuenta; una fecha futura de este mes no cuenta; una sesión con minutos inválidos sí marca el día.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave `diario-estudio-sesiones`.
- Para probarlo en el móvil (misma Wi-Fi): servidor Node escuchando en `0.0.0.0:8080` y `http://192.168.1.168:8080`. El firewall ya permite `node.exe`; la IP local puede cambiar al reiniciar el router.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).
---

## Notas del workspace (`C:\Users\ferna`)

Este fichero vive en `diario-estudio/` para que el usuario lo vea en IntelliJ. OpenCode lo carga al leer o listar esta carpeta: una sesión que no entre aquí no lo ve al arrancar, y los cambios no se aplican a una sesión ya en marcha (empieza una nueva).

- **Shell**: PowerShell 5.1, no bash. `&&`, `ls -la`, `export VAR=x` fallan.
- **Python NO está instalado** (lo intercepta el alias de la Microsoft Store). Para automatizar o servir archivos usa **Node** (`v24.21.0`), el único intérprete disponible.
- **Java**: OpenJDK `17.0.20.1` (Eclipse Adoptium), `JAVA_HOME` ya apunta a `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot\`.
- **Abrir proyectos**: `code <carpeta>` (VS Code en el PATH) o `Start-Process "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\bin\idea64.exe" -ArgumentList "<carpeta>"`.
- **Codificación**: la salida de la shell no es UTF-8 (`2º DAW` aparece como `2? DAW`). Antes de listar rutas: `[Console]::OutputEncoding = [Text.Encoding]::UTF8`. No hardcodes rutas con `º` ni acentos: usa glob/`Get-ChildItem`.
- **Ficheros desechables**: `C:\Users\ferna\AppData\Local\Temp\opencode`.
- **Browser tools**: `browser.tabs.open` solo acepta http/https (con `file://` da `Invalid browser URL`); para ficheros locales usa `browser.preview`. Sin navegador de escritorio conectado → `browser.disconnected`: no insistas, verifica ejecutando el código con Node.
- **Estructura**: `Desktop/hello-java-main/` (curso de terceros; `out/production/**` es código compilado, no editar), `Desktop/2º DAW/` (solo documentos docx/pdf), `eclipse-workspace/` (vacío, solo `.metadata`).
- **No es un repo git** (no hay `.git` en ningún sitio) ni hay build, tests, lint ni CI en la raíz: no crees `package.json`, `pom.xml` ni workflows sin pedirlo.
- **Config de OpenCode**: `C:\Users\ferna\.config\opencode\opencode.jsonc` solo contiene `$schema`. Este es el único `AGENTS.md` del equipo: no hay `CLAUDE.md`, `.cursor/` ni `AGENTS.md` en la raíz.

## Comandos
- Tests: `node --test`
## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.