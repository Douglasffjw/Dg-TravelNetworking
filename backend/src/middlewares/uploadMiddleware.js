const multer = require('multer');

// Armazena na memória para envio rápido ao Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verifica se é uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Apenas imagens são permitidas!'), false);
    }
  }
});

module.exports = upload;