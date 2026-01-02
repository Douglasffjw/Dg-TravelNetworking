import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
// O caminho é '../LoadingSpinner' porque este arquivo está dentro da pasta 'protect/'
import LoadingSpinner from "./LoadingSpinner"; 

/**
 * 💡 Função auxiliar para simular a validação do token.
 * Se o token for null/undefined, retorna false (usuário não autenticado).
 * @returns {Promise<boolean>}
 */
const checkTokenValidity = async (token) => {
    if (!token) return false;
    
    // Na prática, esta função faria uma chamada de API.
    return true; 
};

// -------------------------------------------------------------

/**
 * Hook de Autenticação.
 */
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
    const token = localStorage.getItem("token");

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            
            const isValid = await checkTokenValidity(token);
            setIsAuthenticated(isValid);
        };

        validateToken();
    }, [token]);

    return { isAuthenticated };
};

// -------------------------------------------------------------

/**
 * Componente Guardião de Rotas.
 * Redireciona para /register se o usuário não estiver autenticado.
 */
export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    
    // 1. Loading: Mostra o Spinner enquanto verifica a autenticação
    if (isAuthenticated === null) {
        return <LoadingSpinner />;
    }
    
    // 2. Autenticado (true): Permite o acesso ao conteúdo da rota aninhada
    if (isAuthenticated) {
        return <Outlet />;
    }
    
    // 3. NÃO Autenticado (false): Redireciona forçadamente para o Cadastro
    return <Navigate to="/register" replace />;
}