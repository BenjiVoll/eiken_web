import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configurar Cloudinary (las credenciales vendrán del .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Detectar si es proyecto o servicio por la ruta
    const tipo = req.baseUrl && req.baseUrl.includes('project') ? 'proyecto' :
      req.baseUrl && req.baseUrl.includes('product') ? 'producto' :
        req.baseUrl && (req.baseUrl.includes('quote') || req.path.includes('quote')) ? 'cotizacion' : 'servicio';
    
    return {
      folder: 'eiken_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${tipo}-${Date.now()}`
    };
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

const rawUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Envolvemos multer para que en vez de guardar en PC, inyecte directo 
// la URL de internet segura (req.file.path) en la propiedad que todos los controladores ya conocen (req.file.filename)
const upload = {
  single: (field) => (req, res, next) => {
    rawUpload.single(field)(req, res, (err) => {
      if (err) return next(err);
      if (req.file) {
        req.file.filename = req.file.path;
      }
      next();
    });
  },
  array: (field, maxCount) => (req, res, next) => {
    rawUpload.array(field, maxCount)(req, res, (err) => {
      if (err) return next(err);
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(f => {
          f.filename = f.path;
        });
      }
      next();
    });
  }
};

export default upload;
