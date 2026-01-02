import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    MagnifyingGlassIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    Bars3Icon,
    XMarkIcon,
    LockClosedIcon,
    SunIcon, // Ícone de Sol do Heroicons (mais limpo)
    MoonIcon // Ícone de Lua do Heroicons (para padronizar)
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import logoIcarir from "../assets/símbolo-icarir.png"; // ✅ Import real
import api from "../api/api"; // ✅ Import real

export default function Navbar() {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolledEnough, setScrolledEnough] = useState(false);
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : false;
    });
    const dropdownRef = useRef(null);

    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("token")
    );

    const location = useLocation();
    const isHome = location.pathname === "/";

    // Aplicar tema ao documento
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            document.body.style.backgroundColor = "#2a2a2a";
        } else {
            document.documentElement.classList.remove("dark");
            document.body.style.backgroundColor = "#ffffff";
        }
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        const handleScroll = () => setScrolledEnough(window.scrollY > 430);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);

            if (token) {
                try {
                    const res = await api.get("/auth/me");
                    setUser(res.data);
                } catch (error) {
                    console.error("Sessão inválida", error);
                    handleLogout();
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener("storage", checkAuth);
        checkAuth();
        return () => window.removeEventListener("storage", checkAuth);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setMenuOpen(false);
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "US";
        return name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isTransparent = isHome && !scrolledEnough;

    const navbarClasses = `w-full px-8 py-1 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-500 ${isTransparent
        ? "bg-transparent text-white"
        : "bg-white text-[#394C97] shadow-md"
        }`;

    // --- LÓGICA DE VISIBILIDADE DOS LINKS ---
    const navLinks = [
        // Início agora aparece SEMPRE (Padrão)
        { name: "Início", path: "/" },

        // Cadastro só aparece se NÃO estiver logado
        !isAuthenticated && { name: "Cadastro", path: "/register" },

        // 🔒 Missões e Ranking: Só aparecem se estiver LOGADO e NÃO for ADMIN
        (isAuthenticated && user?.role !== "admin") && { name: "Missão", path: "/missions" },
        (isAuthenticated && user?.role !== "admin") && { name: "Classificação", path: "/ranking" },

        // Admin só vê o botão Administrador
        (user?.role === "admin") && { name: "Administrador", path: "/admin" },
    ].filter(Boolean);

    const userMenuItems = [
        { name: "Perfil", path: "/profile", isLogout: false, icon: UserIcon },
        // Painel de Carreira e Viagens também só fazem sentido para o Usuário Comum
        (user?.role !== "admin") && { name: "Painel", path: "/carreira", isLogout: false, icon: ArrowRightOnRectangleIcon, rotateIcon: true },
        (user?.role !== "admin") && { name: "Viagens", path: "/trips", isLogout: false, icon: ArrowRightOnRectangleIcon, rotateIcon: true },
        { name: "Sair da Conta", path: "/login", isLogout: true, danger: true, icon: ArrowRightOnRectangleIcon },
    ].filter(Boolean);

    return (
        <nav className={navbarClasses}>
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 z-50">
                <img
                    src={logoIcarir}
                    alt="Logo ICARIR"
                    className="h-14 w-auto transition-transform duration-300 hover:scale-105"
                />
            </Link>

            {/* MENU DESKTOP */}
            <ul className="hidden md:flex gap-8 text-base font-medium tracking-wide">
                {navLinks.map((item, index) => (
                    <li key={index} className="relative group">
                        <Link
                            to={item.path}
                            className={`
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                    ${isTransparent ? "text-white hover:text-orange-500" : "text-[#394C97] hover:text-orange-500"}
                `}
                        >
                            {item.name}

                            {/* Underline animado */}
                            <span
                                className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange-500
                    scale-x-0 group-hover:scale-x-100
                    origin-left transition-transform duration-300"
                            ></span>
                        </Link>
                    </li>
                ))}
            </ul>


            {/* ÍCONES */}
            <div className="relative flex items-center gap-5">

                {/* Instagram (Desktop) */}
                <a
                    href="https://www.instagram.com/escoladeempreendedores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
        hidden md:flex items-center gap-2 text-sm font-medium
        relative group
        transition-all duration-200
        active:scale-95
        hover:text-orange-500
    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                    </svg>
                    <span>Instagram</span>

                    {/* Underline animado */}
                    <span
                        className="
            absolute left-0 -bottom-1 w-full h-[2px] bg-orange-500
            scale-x-0 group-hover:scale-x-100
            origin-left transition-transform duration-300
        "
                    ></span>
                </a>


                {/* Toggle Tema Dark/Light (Corrigido para usar SunIcon/MoonIcon) */}
                <button
                    onClick={toggleTheme}
                    className="
        hidden md:flex items-center gap-2 p-2 rounded-lg
        text-sm transition-all duration-200
        hover:text-orange-500 active:scale-95
    "
                    title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                >
                    {isDarkMode ? (
                        // Ícone Sol (Novo: Mais limpo e profissional)
                        <SunIcon className="h-6 w-6" />
                    ) : (
                        // Ícone Lua (Padronizado)
                        <MoonIcon className="h-6 w-6" />
                    )}
                </button>


                {/* Mobile burger */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="hover:text-orange transition focus:outline-none"
                    >
                        {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </button>
                </div>

                <MagnifyingGlassIcon className="h-6 w-6 hover:text-orange cursor-pointer" />
                {/* Ícone BellIcon Removido */}

                {/* **ÁREA DO USUÁRIO** */}
                <div className="relative" ref={dropdownRef}>
                    {isAuthenticated ? (
                        /* Usuário Logado: Mostra Avatar */
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center justify-center focus:outline-none transition-transform hover:scale-105"
                        >
                            {user?.foto_url ? (
                                <img
                                    src={user.foto_url}
                                    alt="Perfil"
                                    className="h-10 w-10 rounded-full object-cover border-2 border-orange"
                                />
                            ) : (
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 font-bold text-xs ${isTransparent
                                        ? "bg-white/20 border-white text-white"
                                        : "bg-[#394C97] border-[#394C97] text-white"
                                    }`}>
                                    {getInitials(user?.nome)}
                                </div>
                            )}
                        </button>
                    ) : (
                        /* Usuário Deslogado: Ícones de Admin e Login */
                        <div className="flex items-center gap-3">
                            {/* 1. Ícone de Admin (Cadeado) */}
                            <Link to="/login" title="Acesso Administrativo">
                                <button className={`hover:text-red-500 transition focus:outline-none flex items-center ${isTransparent ? "text-white/80" : "text-[#394C97]"}`}>
                                    <LockClosedIcon className="h-6 w-6" />
                                </button>
                            </Link>

                            {/* 2. Ícone de Login Padrão */}
                            <Link to="/login" title="Login de Usuário">
                                <button className="hover:text-orange transition focus:outline-none flex items-center">
                                    <UserCircleIcon className="h-6 w-6" />
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* DROPDOWN FLUTUANTE (DESKTOP) */}
                    {menuOpen && isAuthenticated && user && (
                        <div className="absolute right-0 mt-3 w-56 bg-white text-[#394C97] rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                            <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Olá,</p>
                                <p className="text-sm font-bold truncate text-[#FE5900]">{user.nome}</p>
                            </div>

                            <ul className="flex flex-col">
                                {userMenuItems.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={index}>
                                            {item.isLogout ? (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-gray-100 ${item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.name}
                                                </button>
                                            ) : (
                                                <Link
                                                    to={item.path}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#394C97]"
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    <Icon className={`h-4 w-4 ${item.rotateIcon ? "rotate-180" : ""}`} />
                                                    {item.name}
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* MOBILE DROPDOWN */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full right-0 w-full bg-white text-[#394C97] shadow-xl border-t border-gray-100 z-50">
                    <ul className="flex flex-col py-2">
                        {navLinks.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className="block px-6 py-3 text-sm hover:bg-gray-100 transition font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}

                        {!isAuthenticated && (
                            <>
                                <li className="border-t border-gray-100 mt-2 pt-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-6 py-3 text-sm hover:bg-gray-100 transition font-semibold text-[#394C97]"
                                    >
                                        Login Cliente
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-6 py-3 text-sm hover:bg-red-50 transition font-semibold text-red-600 flex items-center gap-2"
                                    >
                                        <LockClosedIcon className="h-4 w-4" />
                                        Área Administrativa
                                    </Link>
                                </li>
                            </>
                        )}

                        {isAuthenticated && user && (
                            <>
                                <div className="border-t border-gray-100 mt-2 pt-2 px-6 pb-2">
                                    <p className="text-xs text-gray-400">Logado como</p>
                                    <p className="text-sm font-bold text-[#FE5900]">{user.nome}</p>
                                </div>
                                {userMenuItems.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={index}>
                                            {item.isLogout ? (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`block w-full text-left px-6 py-3 text-sm transition hover:bg-gray-100 flex items-center gap-2 ${item.danger ? "text-red-500 hover:bg-red-50" : ""}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.name}
                                                </button>
                                            ) : (
                                                <Link
                                                    to={item.path}
                                                    className="block px-6 py-3 text-sm hover:bg-gray-100 transition flex items-center gap-2"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Icon className={`h-4 w-4 ${item.rotateIcon ? "rotate-180" : ""}`} />
                                                    {item.name}
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
}