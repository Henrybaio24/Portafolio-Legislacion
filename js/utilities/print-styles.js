// print-styles.js - Estilos CSS para impresión

export const PRINT_CSS = `
@page {
  size: 210mm 297mm;
  margin: 0;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #faf7f2;
}

body {
  display: block;
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* Cada .a4 = exactamente una hoja */
.a4 {
  box-sizing: border-box !important;
  width: 210mm !important;
  height: 297mm !important;
  overflow: hidden !important;
  box-shadow: none !important;
  display: flex;
  flex-direction: column;
  break-after: page;
  page-break-after: always;
  margin: 0 !important;
  padding-top: 0;
}

.a4:last-of-type {
  break-after: avoid !important;
  page-break-after: avoid !important;
}

/* Ajustes revista al imprimir */
.a4.revista {
  padding: 8mm 14mm !important;
}

.magazine-title {
  font-size: 28pt;
}

.magazine-intro {
  margin-bottom: 3mm;
  padding-bottom: 3mm;
}

.magazine-grid {
  gap: 5mm;
}

.magazine-sidebar {
  gap: 3mm;
}

.section-heading {
  margin: 3mm 0 2mm 0;
}
`;