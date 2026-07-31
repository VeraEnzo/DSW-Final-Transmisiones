const { z } = require('zod');
const { Foto } = require('../models');
const { cloudinary, upload, uploadToCloudinary } = require('../config/cloudinary');

const fotoSchema = z.object({
  // multipart manda strings: "" o ausente equivale a "sin etiqueta".
  etiqueta: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.enum(['ingreso', 'proceso', 'terminado', 'detalle_falla']).nullable()
  ),
});

const uploadFoto = [
  upload.single('foto'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ ok: false, error: 'No se recibió archivo' });

      // Se valida antes de subir, así una etiqueta inválida no deja la imagen huérfana en Cloudinary.
      const { etiqueta } = fotoSchema.parse(req.body);

      const result = await uploadToCloudinary(req.file.buffer, `cajas-automaticas/${id}`);

      try {
        const foto = await Foto.create({
          id_reparacion: id,
          url_cloudinary: result.secure_url,
          public_id_cloudinary: result.public_id,
          etiqueta,
        });
        res.status(201).json({ ok: true, data: foto });
      } catch (err) {
        // Si el insert falla (ej. id_reparacion inexistente) se borra el asset ya subido.
        await cloudinary.uploader.destroy(result.public_id).catch(() => {});
        throw err;
      }
    } catch (err) {
      next(err);
    }
  },
];

const deleteFoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const foto = await Foto.findByPk(id);
    if (!foto) return res.status(404).json({ ok: false, error: 'Foto no encontrada' });

    if (foto.public_id_cloudinary) {
      await cloudinary.uploader.destroy(foto.public_id_cloudinary);
    }

    await foto.destroy();
    res.json({ ok: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFoto, deleteFoto };
