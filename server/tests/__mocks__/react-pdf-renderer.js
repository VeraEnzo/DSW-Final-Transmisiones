'use strict';

// Stub for @react-pdf/renderer — the real package is ESM-only and can't be
// required by Jest in CommonJS mode. In tests we just need generatePresupuestoPDF
// to return a valid Buffer, which is handled by the pdf.js mock below.

const React = require('react');

module.exports = {
  Document: ({ children }) => children,
  Page: ({ children }) => children,
  View: ({ children }) => children,
  Text: ({ children }) => children,
  Image: () => null,
  StyleSheet: { create: (styles) => styles },
  renderToBuffer: async () => Buffer.from('%PDF-1.4 stub'),
};