import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Aqui você pode limpar dados de autenticação, tokens, etc.
    console.log("Usuário desconectado.");
    navigate("/"); // Redireciona para a home após logout
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-3xl font-bold mb-4">Saindo da Conta...</h1>
      <p>Você será redirecionado em instantes.</p>
    </div>
  );
}