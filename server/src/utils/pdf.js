const PDFDocument = require('pdfkit');

const TALLER = {
  nombre: 'Taller de Cajas Automáticas',
  direccion: 'Calle Falsa 123, Ciudad',
  telefono: '+54 11 1234-5678',
  email: 'contacto@tallercajas.com',
};

function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return `$ ${num.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR');
}

function generatePresupuestoPDF(reparacion, items, outputStream) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(outputStream);

  // ── Header ──────────────────────────────────────────────────────────────
  doc.fontSize(20).font('Helvetica-Bold').text('PRESUPUESTO DE REPARACIÓN', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').text(`N° de reparación: ${reparacion.id}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#666').text(`Fecha: ${formatDate(new Date())}`, { align: 'center' });
  doc.fillColor('#000');
  doc.moveDown(1);

  // ── Taller ───────────────────────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold').text('Datos del Taller:');
  doc.font('Helvetica').fontSize(9);
  doc.text(TALLER.nombre);
  doc.text(TALLER.direccion);
  doc.text(`Tel: ${TALLER.telefono}  |  Email: ${TALLER.email}`);
  doc.moveDown(1);

  // ── Cliente ──────────────────────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold').text('Datos del Cliente:');
  doc.font('Helvetica').fontSize(9);
  doc.text(`Nombre: ${reparacion.cliente_nombre || '-'}`);
  if (reparacion.cliente_empresa) doc.text(`Empresa: ${reparacion.cliente_empresa}`);
  if (reparacion.cliente_telefono) doc.text(`Teléfono: ${reparacion.cliente_telefono}`);
  doc.moveDown(1);

  // ── Caja ─────────────────────────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold').text('Datos de la Caja:');
  doc.font('Helvetica').fontSize(9);
  doc.text(`N° de Serie: ${reparacion.numero_serie || '-'}`);
  doc.text(`Tipo: ${reparacion.tipo_vehiculo || '-'}  |  Marca: ${reparacion.marca || '-'}  |  Modelo: ${reparacion.modelo || '-'}`);
  doc.text(`Fecha de ingreso: ${formatDate(reparacion.fecha_ingreso)}`);
  if (reparacion.falla_declarada) doc.text(`Falla declarada: ${reparacion.falla_declarada}`);
  doc.moveDown(1.5);

  // ── Items table ───────────────────────────────────────────────────────────
  const tableTop = doc.y;
  const colX = [50, 270, 340, 420, 500];
  const headers = ['Descripción', 'Obs.', 'Cant.', 'P. Unit.', 'Subtotal'];

  // Header row
  doc.font('Helvetica-Bold').fontSize(9);
  doc.rect(50, tableTop, 510, 18).fill('#2c3e50');
  doc.fillColor('#fff');
  headers.forEach((h, i) => {
    doc.text(h, colX[i], tableTop + 4, { width: colX[i + 1] ? colX[i + 1] - colX[i] - 4 : 60, align: i > 1 ? 'right' : 'left' });
  });
  doc.fillColor('#000').font('Helvetica').fontSize(9);

  let y = tableTop + 18;
  let total = 0;

  items.forEach((item, idx) => {
    const subtotal = (parseFloat(item.precio_unitario) || 0) * (item.cantidad || 1);
    total += subtotal;
    const rowColor = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
    doc.rect(50, y, 510, 16).fill(rowColor).fillColor('#000');

    doc.text(item.descripcion, colX[0], y + 3, { width: 215, ellipsis: true });
    doc.text(item.observacion || '', colX[1], y + 3, { width: 65, ellipsis: true });
    doc.text(String(item.cantidad), colX[2], y + 3, { width: 75, align: 'right' });
    doc.text(formatCurrency(item.precio_unitario), colX[3], y + 3, { width: 75, align: 'right' });
    doc.text(formatCurrency(subtotal), colX[4], y + 3, { width: 60, align: 'right' });
    y += 16;
  });

  // Total row
  doc.rect(50, y, 510, 20).fill('#2c3e50');
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(10);
  doc.text('TOTAL:', colX[3], y + 4, { width: 75, align: 'right' });
  doc.text(formatCurrency(total), colX[4], y + 4, { width: 60, align: 'right' });
  doc.fillColor('#000');

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = Math.max(y + 60, doc.page.height - 150);
  doc.font('Helvetica').fontSize(9);
  doc.text(
    'Este presupuesto tiene validez de 30 días desde la fecha de emisión.',
    50,
    footerY
  );
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(300, doc.y).stroke();
  doc.text('Firma y aclaración del cliente', 50, doc.y + 4);

  doc.end();
}

module.exports = { generatePresupuestoPDF };
