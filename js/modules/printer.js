// printer.js - Funciones de impresión
import { PRINT_CSS } from '../utilities/print-styles.js';

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap';

function collectInlineStyles() {
  return Array.from(document.querySelectorAll('style'))
    .map(s => s.textContent)
    .join('\n');
}

function collectCssLinks() {
  return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => `<link rel="stylesheet" href="${link.href}">`)
    .join('\n');
}

function collectPagesHtml() {
  return Array.from(document.querySelectorAll('.page-wrapper .a4'))
    .map(p => p.outerHTML)
    .join('');
}

function buildPrintDocument(content) {
  const cssLinks = collectCssLinks();
  const inlineStyles = collectInlineStyles();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
  ${cssLinks}
  <style>
    ${PRINT_CSS}
    ${inlineStyles}
  </style>
</head>
<body>${content}</body>
</html>`;
}

function printAll() {
  const content = collectPagesHtml();
  const docHtml = buildPrintDocument(content);

  const win = window.open('', '_blank');
  win.document.write(docHtml);
  win.document.close();
  win.focus();

  // Esperar fuentes + imágenes antes de imprimir
  setTimeout(() => {
    win.print();
    win.close();
  }, 2500);
}

export { printAll };