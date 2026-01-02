import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    CheckCircleIcon,
    BuildingOffice2Icon, // Ícone para Empresa
    KeyIcon              // Ícone para Chave Mestra
} from "@heroicons/react/24/outline";
import api from "../api/api"; // ✅ Usando a instância configurada do Axios

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        isAdmin: false, // Controle do checkbox
        adminKey: ""    // Chave de segurança
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError("");
        setSuccess("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("As senhas não coincidem. Por favor, verifique.");
            setLoading(false);
            return;
        }

        try {
            // Monta o payload dinamicamente
            const payload = {
                nome: form.name,
                email: form.email,
                senha: form.password,
            };

            // Se for admin, injeta os dados de segurança
            if (form.isAdmin) {
                payload.role = "admin";
                payload.adminKey = form.adminKey;
            }

            const res = await api.post("/auth/register", payload);

            setSuccess("Conta criada com sucesso! Redirecionando...");
            
            // Limpa form
            setForm({ name: "", email: "", password: "", confirmPassword: "", isAdmin: false, adminKey: "" });

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error("Erro no cadastro:", err);
            setError(err.response?.data?.error || "Erro ao cadastrar. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#394C97] to-[#1E2A5E] px-4 pt-[50px] pb-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden"
            >
                {/* Barra decorativa */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#394C97] to-[#FE5900]"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-[#394C97] tracking-tight">
                        Criar Conta
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Junte-se a nós para começar sua jornada.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Nome */}
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Nome completo"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white transition"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white transition"
                            required
                        />
                    </div>

                    {/* Senha */}
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white transition"
                            required
                        />
                    </div>

                    {/* Confirmar Senha */}
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar senha"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394C97] outline-none bg-gray-50 focus:bg-white transition"
                            required
                        />
                    </div>

                    {/* --- ÁREA ADMINISTRATIVA (TOGGLE) --- */}
                    <div className="pt-2 border-t border-gray-100 mt-2">
                        <label className="flex items-center space-x-3 cursor-pointer group select-none">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    name="isAdmin"
                                    className="sr-only" 
                                    checked={form.isAdmin}
                                    onChange={handleChange}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${form.isAdmin ? 'bg-[#FE5900]' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.isAdmin ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-[#394C97] transition">
                                <BuildingOffice2Icon className="h-5 w-5 mr-1" />
                                Sou da Empresa (Admin)
                            </div>
                        </label>

                        {/* Campo da Chave Secreta (Animação) */}
                        <AnimatePresence>
                            {form.isAdmin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative">
                                        <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#FE5900]" />
                                        <input
                                            type="password"
                                            name="adminKey"
                                            placeholder="Chave de Segurança da Empresa"
                                            value={form.adminKey}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-[#FE5900]/30 rounded-lg focus:ring-2 focus:ring-[#FE5900] focus:border-[#FE5900] outline-none transition bg-orange-50 focus:bg-white text-[#FE5900] placeholder-orange-300 font-medium"
                                            required={form.isAdmin}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 ml-1">
                                        * Requer chave mestra fornecida pela organização.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Feedback de Erro */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Feedback de Sucesso */}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center justify-center bg-green-50 text-green-600 p-3 rounded-lg border border-green-200"
                        >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            <p className="text-sm font-medium">{success}</p>
                        </motion.div>
                    )}

                    {/* Botão */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full flex items-center justify-center gap-2 py-3.5 rounded-lg 
                            text-white font-bold text-lg shadow-lg transition transform hover:-translate-y-0.5
                            ${loading 
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#394C97] hover:bg-[#2d3b75] hover:shadow-blue-900/30"
                            }
                        `}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Registrar"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-[#FE5900] hover:text-[#e04f00] hover:underline transition"
                    >
                        Entrar aqui
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}