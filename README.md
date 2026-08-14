# 🌐 openMUN

**The Modern, Modular & Real-Time Model United Nations Chairing Platform**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PeerJS](https://img.shields.io/badge/P2P-PeerJS-crimson)](https://peerjs.com/)
[![License: GNU AGPLv3]

*A full-featured, zero-latency desktop and projection platform designed for MUN chairs, delegates, and secretariats.*

[Características](#-características-principales) •
[Módulos y Pistas](#-módulos-y-vistas) •
[Instalación](#-instalación-y-despliegue) •
[Sincronización P2P](#-sincronización-en-tiempo-real-p2p) •
[Accesibilidad](#-accesibilidad-y-temas) •
[Estructura](#-estructura-del-proyecto) •
 
---

## 📌 Descripción

**openMUN** es una suite integral de gestión y proyección de comités para debates de Model United Nations (MUN). Diseñada para ofrecer máxima fluidez a las mesas directivas (Chairs) y total claridad a las delegaciones, openMUN combina un sistema de **widgets modulares y arrastrables**, sincronización inalámbrica **Peer-to-Peer (P2P)** para proyectores o pantallas secundarias sin servidores externos, y herramientas avanzadas de votación, cronómetros y control de quórum.

---

## ✨ Características Principales

- ⏱️ **Cronómetros Dinámicos y Duales**: Control de tiempo individual de orador, tiempo total de debate moderado/inmoderado y alertas visuales.
- 📋 **Lista General de Oradores (GSL)**: Gestión intuitiva de turnos de palabra, cesiones de tiempo (*yields*) y oradores pendientes.
- 🏛️ **Gestión de Quórum y Asistencia**:
  - Matriz de países con estados: *Presente*, *Presente y Votando*, y *Ausente*.
  - Cálculo automático de mayorías (Simple, 2/3, Mayorías Calificadas).
- 🗳️ **Sistema Oficial de Votaciones**:
  - Procedimentales y Sustantivas.
  - Opciones de *A favor*, *En contra*, *Abstención* y *Pase*.
  - Cálculo instantáneo de resultados y desglose por delegación.
- 💡 **Pizarra de Mociones**: Registro, orden jerárquico y votación de mociones de debate, puntos de privilegio, etc.
- 🔄 **Sincronización P2P en Tiempo Real (PeerJS)**:
  - Comparte la vista de proyección o control con otros dispositivos mediante un código QR o enlace, sin necesidad de base de datos externa.
- 🧩 **Layouts Modulares y Personalizables**: Sistema drag-and-drop con rejilla adaptable para acomodar cada vista según la necesidad de la mesa.
- 📊 **Importación y Exportación**:
  - Carga masiva de delegaciones desde archivos Excel (`.xlsx`) o JSON.
  - Exportación de copias de seguridad de la sesión en almacenamiento local / JSON.
- ♿ **Inclusividad y Accesibilidad**: Soporte para fuentes optimizadas para dislexia, modos para daltonismo (Protanopia, Deuteranopia, Tritanopia) y cambio entre tema Claro/Oscuro.

---

## 📑 Módulos y Vistas

| Pestaña | Propósito | Widgets Destacados |
| :--- | :--- | :--- |
| **COMIENZO** | Configuración inicial y pase de lista | Agenda del Comité, Importador de Países, Matriz de Asistencia. |
| **GSL** | Gestión de Lista General de Oradores | Lista de Oradores Activa, Cronómetro Principal, Búsqueda de Países. |
| **DEBATE** | Moderados e Inmoderados | Cronómetro Dual (Total + Orador), Pizarra de Mociones, Añadir Delegación. |
| **VOTING** | Votación de resoluciones y enmiendas | Votación Oficial de Comité, Matriz de Votos en Vivo. |
| **INFO** | Análisis y estadísticas de la sesión | Histórico de Delegaciones, Participaciones y Matriz General. |
| **LAB** | Área de trabajo libre y multipanel | Panel modular con cronómetros, mociones y listas simultáneas. |

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Gestor de paquetes: `npm`, `pnpm` o `yarn`

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/openMUN.git
   cd openMUN
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📡 Sincronización en Tiempo Real (P2P)

openMUN utiliza **WebRTC (a través de PeerJS)** para conectar la pantalla del moderador (Host) con la vista de delegados/proyección (Client):

1. En la barra superior, haz clic en **Sincronización P2P / Conectar**.
2. Escanea el código **QR** generado o copia el **ID de Sala** en el ordenador o proyector conectado.
3. Cualquier cambio en los cronómetros, listas de oradores o votaciones se reflejará instantáneamente con latencia mínima.

---

## 🎨 Accesibilidad y Temas

openMUN está diseñado para ser usado en salones de conferencia con todo tipo de iluminación y por cualquier usuario:
- **Modo Claro / Modo Oscuro** de alto contraste para máxima legibilidad en proyectores.
- **Tipografía OpenDyslexic**: Activación inmediata desde el panel de ajustes.
- **Filtros de Accesibilidad Cromática**: Adaptación de colores de votación y badges para usuarios con daltonismo.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Gestión de Cuadrícula y Layouts**: `react-grid-layout`
- **Redes e Interconexión**: `PeerJS` + `QRCode.react`
- **Hojas de Cálculo**: `xlsx` (SheetJS)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Estilos**: Vanilla CSS optimizado con variables CSS personalizables y diseño responsivo.

---

## 📂 Estructura del Proyecto

```text
openMUN/
├── public/              # Recursos estáticos y banderas
├── src/
│   ├── assets/          # Íconos, imágenes y media
│   ├── components/      # Componentes UI generales
│   │   └── widgets/     # Widgets modulares de debate y votación
│   ├── config/          # Layouts maestros y configuraciones JSON
│   ├── context/         # Estados globales de React (Sesión, Debate, UI)
│   ├── layouts/         # Sistema de cuadrícula y layouts de vistas
│   ├── services/        # Lógica de conexión PeerJS y P2P
│   ├── App.jsx          # Enrutamiento principal y barra de navegación
│   └── main.jsx         # Punto de entrada de la aplicación
├── package.json
└── README.md
```

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **GNU AGPLv3**. Consulta el archivo `LICENSE` para más detalles.

---
```
