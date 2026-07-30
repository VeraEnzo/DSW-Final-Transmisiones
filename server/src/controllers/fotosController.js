const { Foto } = require('../models');
const { cloudinary, upload, uploadToCloudinary } = require('../config/cloudinary');

const uploadFoto = [
  upload.single('foto'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ ok: false, error: 'No se recibió archivo' });

      const result = await uploadToCloudinary(req.file.buffer, `cajas-automaticas/${id}`);
      const etiqueta = req.body.etiqueta || null;

      const foto = await Foto.create({
        id_reparacion: id,
        url_cloudinary: result.secure_url,
        public_id_cloudinary: result.public_id,
        etiqueta,
      });
      res.status(201).json({ ok: true, data: foto });
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
