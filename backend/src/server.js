const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require('fs');
const setupSwagger = require("./swagger");
// ✅ MANTER: Importações necessárias para as rotas /auth e /users
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();
app.use(express.json());
app.use(cookieParser());
setupSwagger(app); // 1. Configuração do Swagger

// ✅ Configuração única do CORS para o frontend (Vite)
app.use(
  cors({
    origin: "http://localhost:5173", // porta correta do front-end com Vite
    credentials: true,
  })
);

// ✅ Rota de Autenticação e Usuários
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ Rotas da API principal (se o mainRouter incluir outras rotas)
const mainRouter = require("./routes/index");
app.use("/api", mainRouter);

// ✅ Redirecionar a raiz para o front-end
app.get("/", (req, res) => {
  res.redirect("http://localhost:5173");
});

// Garantir que a pasta de uploads exista antes de iniciar o servidor
try {
  const uploadsPath = path.join(__dirname, '..', 'uploads', 'evidences');
  fs.mkdirSync(uploadsPath, { recursive: true });
  // opcional: também garantir a pasta uploads (pai)
  fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });
} catch (err) {
  console.error('Erro criando pasta de uploads:', err);
}

// ✅ Servir arquivos estáticos (imagens enviadas)
// Servir uploads estáticos (permitir acesso via /uploads/...)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// ✅ Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});