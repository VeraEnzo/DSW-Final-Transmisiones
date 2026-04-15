'use strict';

const React = require('react');
const {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  renderToBuffer,
} = require('@react-pdf/renderer');
const path = require('path');
const fs   = require('fs');

const el = React.createElement;

// ── Constants ────────────────────────────────────────────────────────────────

const LOGO_PATH = path.join(__dirname, '../assets/logo.png');

const TALLER = {
  razon_social:    'AGRO-TRANSMISIONES ROSARIO SAS',
  domicilio1:      'JUJUY 2572 (2124)',
  domicilio2:      'VILLA GDOR. GALVEZ, STA FE',
  condicion_iva:   'IVA Responsable Inscripto',
  tel:             '3412101829',
  cuit:            '30718578651',
  ingresos_brutos: '9710167814',
  fecha_inicio:    '01/06/2024',
};

const COL_WIDTHS = {
  item:     '6.8%',
  desc:     '38.8%',
  alic:     '8.7%',
  cantidad: '9.7%',
  bultos:   '8.7%',
  precio:   '14.6%',
  subtotal: '12.6%',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value) {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '-';
  if (typeof d === 'string' && d.length >= 10) {
    const [year, month, day] = d.substring(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
  const dt    = new Date(d);
  const day   = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${dt.getFullYear()}`;
}

function pad(n, len) { return String(n).padStart(len, '0'); }

// ── Styles ───────────────────────────────────────────────────────────────────

const B  = '#000000';
const BW = 0.8;

const S = StyleSheet.create({
  page: {
    paddingTop:        36,
    paddingHorizontal: 40,
    paddingBottom:     60,
    fontFamily:        'Helvetica',
    fontSize:          7.5,
    color:             '#000',
    flexDirection:     'column',
  },

  // Outer border wraps all content
  outerBorder: {
    flex:            1,
    borderWidth:     1,
    borderColor:     B,
    borderStyle:     'solid',
    flexDirection:   'column',
  },

  // ── ROW 1: ORIGINAL ────────────────────────────────────────────────────────
  originalRow: {
    borderBottomWidth: BW,
    borderBottomColor: B,
    borderBottomStyle: 'solid',
    paddingVertical:   5,
    alignItems:        'center',
  },
  originalText: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   11,
  },

  // ── ROW 2: HEADER ──────────────────────────────────────────────────────────
  headerRow: {
    flexDirection:     'row',
    borderBottomWidth: BW,
    borderBottomColor: B,
    borderBottomStyle: 'solid',
    height:            120,
  },
  headerLeft: {
    width:            '50%',
    borderRightWidth: BW,
    borderRightColor: B,
    borderRightStyle: 'solid',
    flexDirection:    'column',
    paddingLeft:      6,
    paddingRight:     6,
    paddingTop:       4,
    paddingBottom:    4,
  },
  headerRight: {
    width:          '50%',
    flexDirection:  'column',
    alignItems:     'center',
    paddingLeft:    8,
    paddingRight:   8,
    paddingBottom:  4,
  },
  logoImg: {
    height:    55,
    objectFit: 'contain',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  logoMissing: {
    fontSize:   9,
    fontFamily: 'Helvetica-Bold',
    marginTop:  10,
  },
  hdrDataRow: {
    flexDirection: 'row',
    marginTop:     3,
  },
  hdrLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   7.5,
  },
  hdrValue: {
    fontFamily: 'Helvetica',
    fontSize:   7.5,
    flexShrink: 1,
  },
  presupuestoTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   18,
    marginTop:  10,
    textAlign:  'center',
  },
  comprNro: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   9,
    textAlign:  'center',
    marginTop:  8,
  },
  fechaEmision: {
    fontFamily: 'Helvetica',
    fontSize:   8.5,
    textAlign:  'center',
    marginTop:  6,
  },
  hdrRightData: {
    alignSelf:   'flex-start',
    marginTop:   8,
    paddingLeft: 4,
  },

  // ── ROW 3: CLIENT ──────────────────────────────────────────────────────────
  clientRow: {
    flexDirection:     'row',
    borderBottomWidth: BW,
    borderBottomColor: B,
    borderBottomStyle: 'solid',
    minHeight:         42,
    paddingVertical:   5,
  },
  clientLeft: {
    width:         '50%',
    flexDirection: 'column',
    paddingLeft:   6,
    paddingRight:  6,
  },
  clientRight: {
    width:         '50%',
    flexDirection: 'column',
    paddingLeft:   6,
    paddingRight:  6,
  },
  clientDataRow: {
    flexDirection: 'row',
    marginBottom:  4,
  },

  // ── ROW 4: VENDEDOR ────────────────────────────────────────────────────────
  // No bottom border — table header follows directly
  vendedorRow: {
    flexDirection:  'row',
    paddingLeft:    6,
    paddingTop:     4,
    paddingBottom:  4,
  },

  // ── TABLE HEADER ───────────────────────────────────────────────────────────
  tableHeaderRow: {
    flexDirection:     'row',
    backgroundColor:   '#e0e0e0',
    borderTopWidth:    BW,
    borderTopColor:    B,
    borderTopStyle:    'solid',
    borderBottomWidth: BW,
    borderBottomColor: B,
    borderBottomStyle: 'solid',
  },
  tableHeaderCell: {
    borderRightWidth: 0.6,
    borderRightColor: B,
    borderRightStyle: 'solid',
    paddingHorizontal: 2,
    paddingVertical:   4,
  },
  tableHeaderCellLast: {
    paddingHorizontal: 2,
    paddingVertical:   4,
  },
  tableHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   7.5,
    textAlign:  'center',
  },

  // ── ITEM ROWS ──────────────────────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
  },
  itemCell: {
    paddingHorizontal: 2,
    paddingVertical:   2,
  },
  itemCellLast: {
    paddingHorizontal: 2,
    paddingVertical:   2,
  },
  itemText: {
    fontFamily: 'Helvetica',
    fontSize:   7.5,
  },

  // Spacer pushes totals to bottom
  spacer: { flexGrow: 1 },

  // ── TOTALS ROW ─────────────────────────────────────────────────────────────
  totalsRow: {
    borderTopWidth:  BW,
    borderTopColor:  B,
    borderTopStyle:  'solid',
    flexDirection:   'row',
    height:          32,
  },
  totalsLeft: {
    flex:            1,
    paddingLeft:     6,
    paddingRight:    6,
    flexDirection:   'column',
    justifyContent:  'center',
  },
  totalsRight: {
    width:           155,
    borderLeftWidth: BW,
    borderLeftColor: B,
    borderLeftStyle: 'solid',
    paddingLeft:     6,
    paddingRight:    6,
    flexDirection:   'column',
    justifyContent:  'center',
    alignItems:      'flex-end',
    alignSelf:       'stretch',
  },
  totalsLabelBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   8,
  },
  totalsValues: {
    fontFamily: 'Helvetica',
    fontSize:   8,
    marginTop:  3,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   9,
  },
  totalAmount: {
    fontFamily: 'Helvetica-Bold',
    fontSize:   11,
    marginTop:  2,
  },

  // ── EMPTY BOXES (fuera del outerBorder, cajas independientes) ───────────────
  emptyBox1: {
    height:      50,
    marginTop:   2,
    borderWidth: 1,
    borderColor: B,
    borderStyle: 'solid',
  },

  gap2: { height: 2 },

  emptyBox2: {
    height:      36,
    borderWidth: 1,
    borderColor: B,
    borderStyle: 'solid',
  },

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  footer: {
    position:   'absolute',
    bottom:     12,
    left:       40,
    right:      40,
    fontFamily: 'Helvetica',
    fontStyle:  'italic',
    fontSize:   7,
    color:      '#555',
    textAlign:  'right',
  },
});

// ── Sub-components ────────────────────────────────────────────────────────────

function LabelValue(label, value) {
  return el(View, { style: S.hdrDataRow },
    el(Text, { style: S.hdrLabel }, label + ' '),
    el(Text, { style: S.hdrValue }, String(value || '-'))
  );
}

function ClientLabelValue(label, value) {
  return el(View, { style: S.clientDataRow },
    el(Text, { style: S.hdrLabel }, label + ' '),
    el(Text, { style: S.hdrValue }, String(value || '-'))
  );
}

// ── Main Document Component ───────────────────────────────────────────────────

function PresupuestoPDF({ reparacion, items }) {
  const logoExists = fs.existsSync(LOGO_PATH);
  // Use Buffer to avoid file:// path issues on Windows
  const logoData   = logoExists ? fs.readFileSync(LOGO_PATH) : null;

  const IVA_RATE     = 0.21;
  let   subtotalNeto = 0;
  items.forEach(item => {
    const qty   = parseFloat(item.cantidad) || 1;
    const price = parseFloat(item.precio_unitario) || 0;
    subtotalNeto += qty * price;
  });
  const ivaAmt = subtotalNeto * IVA_RATE;
  const total  = subtotalNeto + ivaAmt;

  return el(Document, null,
    el(Page, { size: 'A4', style: S.page },

      // ── Outer border ───────────────────────────────────────────────────────
      el(View, { style: S.outerBorder },

        // ROW 1: ORIGINAL
        el(View, { style: S.originalRow },
          el(Text, { style: S.originalText }, 'ORIGINAL')
        ),

        // ROW 2: HEADER
        el(View, { style: S.headerRow },

          // Left: logo + taller data
          el(View, { style: S.headerLeft },
            logoData
              ? el(Image, { src: logoData, style: S.logoImg })
              : el(Text, { style: S.logoMissing }, 'AGRO-TRANSMISIONES'),
            LabelValue('Razón Social:', TALLER.razon_social),
            LabelValue('Domicilio Comercial:', TALLER.domicilio1),
            el(View, { style: S.hdrDataRow },
              el(Text, { style: S.hdrValue }, TALLER.domicilio2)
            ),
            LabelValue('Condición frente al IVA:', TALLER.condicion_iva),
            LabelValue('Tel:', TALLER.tel)
          ),

          // Right: title + fiscal data
          el(View, { style: S.headerRight },
            el(Text, { style: S.presupuestoTitle }, 'PRESUPUESTO'),
            el(Text, { style: S.comprNro },
              `Compr. Nro:  0001-${pad(reparacion.id, 8)}`
            ),
            el(Text, { style: S.fechaEmision },
              `Fecha de Emisión:  ${fmtDate(new Date())}`
            ),
            el(View, { style: S.hdrRightData },
              LabelValue('CUIT:', TALLER.cuit),
              LabelValue('Ingresos Brutos:', TALLER.ingresos_brutos),
              LabelValue('Fecha de Inicio de Actividades:', TALLER.fecha_inicio)
            )
          )
        ),

        // ROW 3: CLIENT
        el(View, { style: S.clientRow },
          el(View, { style: S.clientLeft },
            ClientLabelValue('Sr(es):', reparacion.cliente_nombre),
            ClientLabelValue('CUIT:', reparacion.cliente_cuit)
          ),
          el(View, { style: S.clientRight },
            ClientLabelValue('Domicilio:', reparacion.cliente_empresa),
            ClientLabelValue('Condición frente al IVA:', 'IVA Responsable Inscripto')
          )
        ),

        // ROW 4: VENDEDOR (sin borde inferior — la tabla sigue)
        el(View, { style: S.vendedorRow },
          el(Text, { style: S.hdrLabel }, 'Vendedor:  '),
          el(Text, { style: S.hdrValue }, reparacion.tecnico || '-')
        ),

        // TABLE HEADER
        el(View, { style: S.tableHeaderRow },
          el(View, { style: [S.tableHeaderCell, { width: COL_WIDTHS.item }] },
            el(Text, { style: S.tableHeaderText }, 'Ítem')
          ),
          el(View, { style: [S.tableHeaderCell, { width: COL_WIDTHS.desc }] },
            el(Text, { style: [S.tableHeaderText, { textAlign: 'left' }] }, 'Descripción')
          ),
          el(View, { style: [S.tableHeaderCell, { width: COL_WIDTHS.alic }] },
            el(Text, { style: S.tableHeaderText }, 'Alic.%')
          ),
          el(View, { style: [S.tableHeaderCell, { width: COL_WIDTHS.cantidad }] },
            el(Text, { style: S.tableHeaderText }, 'Cantidad')
          ),
          el(View, { style: [S.tableHeaderCell, { width: COL_WIDTHS.bultos }] },
            el(Text, { style: S.tableHeaderText }, 'Bultos')
          ),
          el(View, { style: [S.tableHeaderCell, { width: COL_WIDTHS.precio }] },
            el(Text, { style: S.tableHeaderText }, 'Precio Unit ($)')
          ),
          el(View, { style: [S.tableHeaderCellLast, { width: COL_WIDTHS.subtotal }] },
            el(Text, { style: S.tableHeaderText }, 'Subtotal ($)')
          )
        ),

        // ITEM ROWS
        ...items.map((item, idx) => {
          const qty   = parseFloat(item.cantidad) || 1;
          const price = parseFloat(item.precio_unitario) || 0;
          const sub   = qty * price;
          return el(View, { key: String(item.id || idx), style: S.itemRow },
            el(View, { style: [S.itemCell, { width: COL_WIDTHS.item }] },
              el(Text, { style: [S.itemText, { textAlign: 'center' }] }, pad(idx + 1, 4))
            ),
            el(View, { style: [S.itemCell, { width: COL_WIDTHS.desc }] },
              el(Text, { style: S.itemText }, item.descripcion || '')
            ),
            el(View, { style: [S.itemCell, { width: COL_WIDTHS.alic }] },
              el(Text, { style: [S.itemText, { textAlign: 'center' }] }, '21,00')
            ),
            el(View, { style: [S.itemCell, { width: COL_WIDTHS.cantidad }] },
              el(Text, { style: [S.itemText, { textAlign: 'center' }] }, fmt(qty))
            ),
            el(View, { style: [S.itemCell, { width: COL_WIDTHS.bultos }] },
              el(Text, { style: [S.itemText, { textAlign: 'center' }] }, '0,00')
            ),
            el(View, { style: [S.itemCell, { width: COL_WIDTHS.precio }] },
              el(Text, { style: [S.itemText, { textAlign: 'right' }] }, fmt(price))
            ),
            el(View, { style: [S.itemCellLast, { width: COL_WIDTHS.subtotal }] },
              el(Text, { style: [S.itemText, { textAlign: 'right' }] }, fmt(sub))
            )
          );
        }),

        // SPACER
        el(View, { style: S.spacer }),

        // TOTALS ROW
        el(View, { style: S.totalsRow },
          el(View, { style: S.totalsLeft },
            el(Text, { style: S.totalsLabelBold }, 'SubT 21,00 %   IVA 21,00 %'),
            el(Text, { style: S.totalsValues }, `${fmt(subtotalNeto)}   ${fmt(ivaAmt)}`)
          ),
          el(View, { style: S.totalsRight },
            el(Text, { style: S.totalLabel }, 'TOTAL ($)'),
            el(Text, { style: S.totalAmount }, fmt(total))
          )
        ),

      ), // end outerBorder

      // EMPTY BOX 1 — caja independiente
      el(View, { style: S.emptyBox1 }),

      // GAP
      el(View, { style: S.gap2 }),

      // EMPTY BOX 2 — caja independiente
      el(View, { style: S.emptyBox2 }),

      // FOOTER (absolute)
      el(Text, { style: S.footer },
        'Comprobante generado por: Sistema de Gestión — Agrotransmisiones Automáticas'
      )

    ) // end Page
  ); // end Document
}

// ── Export ────────────────────────────────────────────────────────────────────

async function generatePresupuestoPDF(reparacion, items, outputStream) {
  try {
    const buffer = await renderToBuffer(
      el(PresupuestoPDF, { reparacion, items })
    );
    outputStream.end(buffer);
  } catch (err) {
    console.error('[PDF] renderToBuffer error:', err);
    throw err;
  }
}

module.exports = { generatePresupuestoPDF };