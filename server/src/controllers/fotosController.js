const pool = require('../config/db');
const { cloudinary, upload, uploadToCloudinary } = require('../config/cloudinary');

const uploadFoto = [
  upload.single('foto'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ ok: false, error: 'No se recibió archivo' });

      const result = await uploadToCloudinary(req.file.buffer, `cajas-automaticas/${id}`);
      const etiqueta = req.body.etiqueta || null;

      const { rows } = await pool.query(
        `INSERT INTO fotos (id_reparacion, url_cloudinary, public_id_cloudinary, etiqueta)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [id, result.secure_url, result.public_id, etiqueta]
      );
      res.status(201).json({ ok: true, data: rows[0] });
    } catch (err) {
      next(err);
    }
  },
];

const deleteFoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM fotos WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'Foto no encontrada' });

    if (rows[0].public_id_cloudinary) {
      await cloudinary.uploader.destroy(rows[0].public_id_cloudinary);
    }

    await pool.query('DELETE FROM fotos WHERE id = $1', [id]);
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFoto, deleteFoto };
