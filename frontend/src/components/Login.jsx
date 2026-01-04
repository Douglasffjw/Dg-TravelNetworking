import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import api from "../api/api"; // ✅ Import real da sua API

export default function Login() {
  const [form, setForm] = useState({ email: "dg@gmail.com", senha: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Previne recarregamento da página ao dar Enter
    setLoading(true);
    
    try {
      // Chamada real para o seu backend
      const response = await api.post("/auth/login", form);
      const { accessToken, user } = response.data;

      // Salva token e dados do usuário no localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // 🚀 LÓGICA DE REDIRECIONAMENTO:
      // Admin -> /admin
      // Cliente/Participante -> /missions
      navigate(user.role === "admin" ? "/admin" : "/missions");
      
    } catch (err) {
      console.error("Erro no login:", err);
      setError(
        err.response?.data?.error ||
          "E-mail ou senha incorretos. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#006494] to-[#006494] px-4">
      
      {/* Container do Card com Animação */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden"
      >
        {/* Detalhe decorativo no topo (Barra Gradiente) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006494] to-[#986dff]"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#006494] tracking-tight">
            Bem-vindo
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Insira suas credenciais para acessar a plataforma.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Campo Email */}
          <div>
              <label className="block text-xs font-bold text-[#006494] uppercase tracking-wide mb-1">
              Endereço de E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="dg@gmail.com"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006494] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
              <label className="block text-xs font-bold text-[#006494] uppercase tracking-wide mb-1">
              Sua Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange("senha")}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006494] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center justify-center border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-white font-bold text-lg shadow-lg transition transform hover:-translate-y-0.5
              ${loading 
                ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#006494] hover:bg-[#986dff] hover:shadow-[#006494]/30"
              }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Card */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link to="/register" className="font-bold text-[#006494] hover:text-[#986dff] hover:underline transition">
            Cadastre-se gratuitamente
          </Link>
        </div>
      </motion.div>
    </div>
  );
}