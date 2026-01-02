import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    X, Users, Search, Plus, Trash2, UserPlus, AlertTriangle, Loader 
} from 'lucide-react';

// IMPORTANTE: Agora importamos as funções específicas do arquivo que você mostrou
import { 
    fetchUsers, 
    fetchMissionParticipants, 
    addParticipantToMission, 
    removeParticipantFromMission 
} from '../../../api/apiFunctions';

const MissionParticipantsModal = ({ mission, onClose }) => {
    const [participants, setParticipants] = useState([]);
    const [allUsers, setAllUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [addSearchTerm, setAddSearchTerm] = useState(""); 
    const [isAdding, setIsAdding] = useState(false); 

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!mission?.id) return;
            setLoading(true);

            // 1. CARREGAR TODOS OS USUÁRIOS
            try {
                const usersData = await fetchUsers();
                // Normalização robusta: aceita array direto ou { data: [...] }
                const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
                
                if (isMounted) {
                    // Filtra apenas participantes (remove admins)
                    setAllUsers(usersList.filter(u => u.role === 'participante'));
                }
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }

            // 2. CARREGAR PARTICIPANTES DESTA MISSÃO
            try {
                // Usando a função do apiFunctions.js
                const partsData = await fetchMissionParticipants(mission.id);
                
                if (isMounted) {
                    setParticipants(Array.isArray(partsData) ? partsData : []);
                }
            } catch (error) {
                console.warn("Falha ao carregar participantes (pode estar vazio):", error);
                if (isMounted) setParticipants([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [mission.id]);

    const handleAddParticipant = async (userId) => {
        try {
            // Usando a função do apiFunctions.js
            await addParticipantToMission(mission.id, userId);
            
            // Atualiza visualmente
            const userAdded = allUsers.find(u => u.id === userId);
            if (userAdded) {
                setParticipants(prev => [...prev, {
                    userId: userAdded.id,
                    name: userAdded.nome,
                    email: userAdded.email,
                    avatar: userAdded.foto_url,
                    status: 'confirmado',
                    paymentStatus: 'pago',
                    date: new Date().toISOString()
                }]);
            }
            setAddSearchTerm("");
        } catch (error) {
            // Tratamento de erro seguro
            const msg = error.response?.data?.error || error.message || "Erro ao adicionar participante.";
            alert(msg);
        }
    };

    const handleRemoveParticipant = async (userId) => {
        if (!window.confirm("Remover este usuário da missão?")) return;
        try {
            // Usando a função do apiFunctions.js
            await removeParticipantFromMission(mission.id, userId);
            setParticipants(prev => prev.filter(p => p.userId !== userId));
        } catch (error) {
            console.error(error);
            alert("Erro ao remover participante.");
        }
    };

    // --- FILTROS VISUAIS ---
    
    // Lista de quem já está inscrito
    const filteredParticipants = participants.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Lista de quem PODE ser adicionado
    const availableUsers = allUsers.filter(u => {
        // Exclui quem já está na missão (converte para string para garantir)
        const isParticipant = participants.some(p => String(p.userId) === String(u.id));
        if (isParticipant) return false;

        // Se busca vazia, mostra todos
        if (!addSearchTerm.trim()) return true;

        const term = addSearchTerm.toLowerCase();
        return (
            (u.nome && u.nome.toLowerCase().includes(term)) || 
            (u.email && u.email.toLowerCase().includes(term))
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh] z-10"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-[#394C97] flex items-center gap-2">
                            <Users size={20} /> Participantes da Missão
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{mission.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    
                    {/* Área de Adicionar */}
                    <div className="mb-6">
                        {!isAdding ? (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-[#394C97] hover:text-[#394C97] hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                                <UserPlus size={18} /> Vincular Novo Participante
                            </button>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fade-in">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold text-[#394C97]">Selecionar Usuário ({availableUsers.length})</h4>
                                    <button onClick={() => setIsAdding(false)} className="text-xs text-gray-500 hover:text-red-500 font-medium">Cancelar</button>
                                </div>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nome ou email..." 
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        value={addSearchTerm}
                                        onChange={(e) => setAddSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1 bg-white rounded-lg border border-gray-100">
                                    {availableUsers.length > 0 ? availableUsers.map(u => (
                                        <div key={u.id} className="flex justify-between items-center p-3 hover:bg-blue-50 cursor-pointer group transition-colors border-b border-gray-50 last:border-0" onClick={() => handleAddParticipant(u.id)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-[#394C97]">
                                                    {u.nome?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">{u.nome || 'Sem Nome'}</span>
                                                    <span className="text-[10px] text-gray-400">{u.email}</span>
                                                </div>
                                            </div>
                                            <div className="bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus size={14} />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4">
                                            <p className="text-xs text-gray-400 italic">
                                                {allUsers.length === 0 ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de Inscritos */}
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                        <h3 className="font-bold text-gray-800 text-sm">Inscritos ({participants.length})</h3>
                        <div className="relative w-48">
                            <Search className="absolute left-2.5 top-2 text-gray-400 w-3.5 h-3.5" />
                            <input 
                                type="text" 
                                placeholder="Filtrar inscritos..." 
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader className="animate-spin text-[#394C97]" /></div>
                    ) : filteredParticipants.length > 0 ? (
                        <div className="space-y-2">
                            {filteredParticipants.map((p) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    key={p.id || p.userId} 
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        {p.avatar ? (
                                            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#394C97] font-bold">
                                                {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{p.name || 'Sem Nome'}</p>
                                            <p className="text-xs text-gray-500">{p.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <span className="block text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mb-0.5 w-fit ml-auto">
                                                {p.status || 'Inscrito'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {p.date ? new Date(p.date).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveParticipant(p.userId)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remover da missão"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-medium">Nenhum participante encontrado.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MissionParticipantsModal;