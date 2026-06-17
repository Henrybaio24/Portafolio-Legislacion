// printer.js - Funciones de impresión
function printAll() {
  const paginas = document.querySelectorAll('.page-wrapper .a4');
  let contenido = '';
  paginas.forEach(p => contenido += p.outerHTML);

  // Recolectar todos los CSS cargados
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  let cssLinks = '';
  links.forEach(link => {
    cssLinks += `<link rel="stylesheet" href="${link.href}">\n`;
  });

  const inlineStyles = Array.from(document.querySelectorAll('style'))
    .map(s => s.textContent).join('\n');

  const v = window.open('', '_blank');
  v.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  ${cssLinks}
  <style>
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

    /* Wrapper en bloque para evitar espacios flex entre páginas */
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
      /* Salto de página DESPUÉS de cada hoja */
      break-after: page;
      page-break-after: always;
      /* Sin margen ni padding extra */
      margin: 0 !important;
      padding-top: 0;
    }

    /* El último NO genera página en blanco */
    .a4:last-of-type {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    /* Ajuste revista al imprimir */
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

    ${inlineStyles}
  </style>
</head>
<body>${contenido}</body>
</html>`);

  v.document.close();
  v.focus();

  // Esperar fuentes + imágenes antes de imprimir
  setTimeout(() => {
    v.print();
    v.close();
  }, 2500);
}

export { printAll };