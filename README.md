# Box - Industrias Rodanol, S.A.

Sistema de Gestión Integral de Activos Informáticos, Mantenimientos Preventivos, Insumos de Impresión, Préstamos y Residuos Electrónicos (RAEE) para el departamento de IT de **Industrias Rodanol, S.A.** Desarrollado como Progressive Web App (PWA) responsiva para escritorio y dispositivos móviles en planta.

---

## 🛠️ Stack Tecnológico

### Backend (`/backend`)
- **Entorno:** Node.js con Express.js (ES Modules: `"type": "module"`).
- **Base de Datos & ORM:** PostgreSQL gestionado con Sequelize.
- **Validaciones:** Zod integrado mediante middleware reutilizable (`validarEsquema.js`).
- **Reportes:** Generación de libros de Excel (`.xlsx`) institucionales con `exceljs`.

### Frontend (`/frontend`)
- **Framework:** Nuxt 3 (Vue 3 Composition API con `<script setup>`).
- **UI & Estilos:** Nuxt UI + Tailwind CSS (Modo Oscuro con acentos violeta y semáforos de estado).
- **Herramientas Clave:**
  - `html5-qrcode` y cámara nativa para escaneo de etiquetas QR.
  - `qrcode` para generación de cuadrículas imprimibles (`@media print`).
  - Lienzo HTML5 táctil para captura de firmas digitales de conformidad.

---

## 🚀 Puesta en Marcha

### 1. Requisitos Previos
- Node.js v18+ instalado.
- Servidor PostgreSQL instalado y en ejecución en el puerto `5432`.

### 2. Configurar el Backend
```bash
cd backend
npm install
```

Copia el archivo de variables de entorno:
```bash
cp .env.ejemplo .env
```
*(Ajusta la clave de tu usuario de PostgreSQL en `.env` si es distinta a `postgres`).*

Iniciar el servidor API:
```bash
npm run desarrollo
```
> El backend creará automáticamente la base de datos `box_rodanol_bd`, sincronizará las tablas y sembrará datos de prueba iniciales de Rodanol.

### 3. Configurar el Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run desarrollo
```
Accede desde tu navegador en `http://localhost:3000` (o desde el teléfono en tu red local con `http://<IP-DE-TU-PC>:3000`).

---

## 📦 Módulos del Sistema
1. **Parque Informático:** Registro, especificaciones técnicas y Hoja de Vida accesible por QR.
2. **Control de Garantías:** Semáforo automático (`VIGENTE`, `POR VENCER`, `VENCIDA`).
3. **Mantenimiento Preventivo (IR-SI-FO-001):** Jornadas, checklist, firmas digitales táctiles y exportación a Excel.
4. **Insumos de Impresión:** Catálogo de tóners (W2020A, CF230A, etc.) y reemplazo con descuento automático de stock.
5. **Préstamos y Custodia:** Flujo de salida para equipos rotativos con checklist de accesorios y semáforo de devolución.
6. **Banco de Pruebas y RAEE:** Desincorporación, canibalización e impresión de Actas para auditoría.
