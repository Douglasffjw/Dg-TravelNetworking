import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    AlertTriangle, 
    Loader, 
    Edit, 
    Trash2, 
    Plus, 
    Search, 
    Shield, 
    CheckCircle, 
    Mail, 
    UserCircle, 
    RefreshCw 
} from 'lucide-react';
// Importação das funções de API robustas
import { fetchUsers, createUser, updateUser, deleteUserApi } from '../../api/apiFunctions'; 
import UserModal from './UserModal'; 

// --- ESTILOS DE BADGES ---
const getRoleBadge = (role) => {
    switch (role) {
        case 'admin':
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wide"><Shield size={10} /> Admin</span>;
        case 'validador':
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide"><CheckCircle size={10} /> Validador</span>;
        case 'participante':
        default:
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide"><Users size={10} /> Participante</span>;
    }
};

const getStatusBadge = (active) => {
    return active ? 
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Ativo</span> : 
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Inativo</span>;
};

// --- TABELA REESTILIZADA ---
const UserTable = ({ users, onEdit, onDelete, isLoading, showPoints }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                    <tr>
                        {[
                            "Usuário", "Contato", "Função", showPoints ? "Pontuação" : null, "Status", "Registro", "Ações"
                        ].filter(Boolean).map((header, idx) => (
                            <th key={idx} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                    {users.map((user, index) => (
                        <motion.tr 
                            key={user.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-blue-50/30 transition-colors group"
                        >
                            <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#006494] font-bold text-xs border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-100 transition-colors">
                                        {user.nome ? user.nome.charAt(0).toUpperCase() : <UserCircle size={16}/>}
                                    </div>
                                    <div className="font-semibold text-gray-900 text-sm">{user.nome}</div>
                                </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                <div className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" />{user.email}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                            {showPoints && (
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className="font-mono font-bold text-[#006494] bg-blue-50 px-1.5 py-0.5 rounded text-xs">{user.pontos}</span>
                                </td>
                            )}
                            <td className="px-4 py-2 whitespace-nowrap">{getStatusBadge(user.ativo)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-[10px] text-gray-400">{user.data_criacao ? new Date(user.data_criacao).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => onEdit(user)} disabled={isLoading} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"><Edit size={14} /></button>
                                    <button onClick={() => onDelete(user.id)} disabled={isLoading} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                    <Users size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">Nenhum usuário encontrado nesta categoria.</p>
                </div>
            )}
        </div>
    </div>
);

const INITIAL_USER_STATE = { nome: "", email: "", senha: "", pontos: 0, role: "participante", ativo: true };

const UsersContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(INITIAL_USER_STATE);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState('participante');

    // Ref para evitar vazamento de memória e erros em desmontagem
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // CORREÇÃO: Usar fetchUsers() para garantir a rota correta e tratamento de resposta
            const data = await fetchUsers();
            
            if (isMounted.current) {
                // Tratamento robusto para garantir array
                const usersList = Array.isArray(data) ? data : (data?.data || []);
                
                const validUsers = usersList.map(user => ({
                    ...user,
                    data_criacao: user.data_criacao || user.dataCriacao,
                }));
                setUsers(validUsers);
            }
        } catch (err) {
            if (isMounted.current) {
                console.error("Erro no loadUsers:", err);
                // Ignora erro 401 visualmente se for apenas questão de refresh token
                if (err.response?.status !== 401) {
                    setError(`Erro: ${err.message || 'Falha na conexão'}`);
                }
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleModalOpen = (userToEdit = null) => {
        if (userToEdit) {
            setIsEditing(true);
            setCurrentUser({ ...userToEdit, senha: "", pontos: Number(userToEdit.pontos) }); 
        } else {
            setIsEditing(false);
            const defaultRole = activeCategory === 'admin' ? 'admin' : 'participante';
            setCurrentUser({ ...INITIAL_USER_STATE, role: defaultRole });
        }
        setShowModal(true);
    };

    const handleModalClose = () => { setShowModal(false); setIsEditing(false); setCurrentUser(INITIAL_USER_STATE); setError(null); };

    const handleSaveUser = async () => {
        if (!currentUser.nome || !currentUser.email || (!isEditing && !currentUser.senha)) { alert("Preencha Nome, Email e Senha."); return; }
        setIsSaving(true);
        try {
            let response;
            if (isEditing) {
                response = await updateUser(currentUser.id, currentUser);
                const userToUpdate = response.user || response;
                setUsers(prev => prev.map(u => u.id === currentUser.id ? userToUpdate : u));
            } else {
                response = await createUser(currentUser); 
                const newUser = response.user || response;
                if (newUser && newUser.id) setUsers(prev => [...prev, newUser]);
            }
            handleModalClose();
        } catch (err) { setError(`Erro ao salvar: ${err.response?.data?.error || err.message}`); } finally { setIsSaving(false); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Excluir usuário permanentemente?")) return;
        setIsSaving(true);
        try {
            await deleteUserApi(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) { setError(`Erro ao excluir: ${err.message}`); } finally { setIsSaving(false); }
    };

    // Otimização: useMemo para evitar recálculo de filtro a cada render
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'participante' ? user.role === 'participante' : (user.role === 'admin' || user.role === 'validador');
            return matchesSearch && matchesCategory;
        });
    }, [users, searchTerm, activeCategory]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader size={32} className="animate-spin text-[#006494] mb-4" /> 
                <p className="text-gray-500 font-medium text-sm">Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            {/* BANNER */}
            <div className="h-64 w-full bg-[#006494] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 text-white">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20"><Users className="w-6 h-6 text-[#986dff]" /></div>
                        <div><h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Gestão de Usuários</h1><p className="text-blue-100/90 text-sm md:text-base mt-1 font-light">Controle de acesso e membros da plataforma</p></div>
                    </motion.div>
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
                    <div className="flex bg-white p-1 rounded-lg shadow-md border border-gray-100">
                        <button onClick={() => setActiveCategory('participante')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeCategory === 'participante' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Participantes</button>
                        <button onClick={() => setActiveCategory('admin')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeCategory === 'admin' ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Administrativo</button>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 md:flex-none w-full md:w-64 bg-white p-1.5 rounded-lg shadow-md border border-gray-100 flex items-center gap-2 px-3">
                            <Search className="text-gray-400 w-4 h-4" /><input type="text" placeholder="Buscar por nome ou email..." className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-xs py-1.5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </motion.div>
                        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => handleModalOpen()} className="bg-[#986dff] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#e04f00] hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 font-bold text-xs tracking-wide transform hover:-translate-y-0.5 whitespace-nowrap"><Plus size={14} strokeWidth={3} /> NOVO</motion.button>
                    </div>
                </div>

                {error && users.length === 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between gap-3 mb-4 shadow-sm text-sm">
                        <div className="flex items-center gap-2"><AlertTriangle size={16} /><span>{error}</span></div>
                        <button onClick={loadUsers} className="p-1.5 hover:bg-red-100 rounded-md transition-colors"><RefreshCw size={14} /></button>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <UserTable users={filteredUsers} onEdit={handleModalOpen} onDelete={handleDeleteUser} isLoading={isSaving} showPoints={activeCategory === 'participante'} />
                </motion.div>

                <div className="mt-3 text-right text-[10px] font-medium text-gray-400">Total nesta categoria: {filteredUsers.length}</div>

                {showModal && <UserModal user={currentUser} setUser={setCurrentUser} handleSave={handleSaveUser} handleClose={handleModalClose} isEditing={isEditing} isLoading={isSaving} />}
            </div>
        </div>
    );
};

export default UsersContent;