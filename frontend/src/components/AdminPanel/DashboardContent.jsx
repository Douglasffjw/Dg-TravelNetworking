import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Loader, 
    AlertTriangle, 
    Target, 
    CheckCircle, 
    BarChart2, 
    Users, 
    Trophy,
    LayoutDashboard,
    TrendingUp,
    RefreshCw,
    Medal
} from 'lucide-react';

// ===================================================================
// API CLIENT
// ===================================================================
const fetchStats = async () => {
    const baseUrl = typeof process !== 'undefined' && process.env?.REACT_APP_API_URL 
        ? process.env.REACT_APP_API_URL 
        : 'http://localhost:3001/api'; 

    const token = localStorage.getItem('token') || localStorage.getItem('user_token') || '';

    try {
        const response = await fetch(`${baseUrl}/admin/dashboard/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API (${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error("Falha na requisição real:", error);
        throw error;
    }
};

// ===================================================================
// COMPONENTES DE UI
// ===================================================================

const StatsCard = ({ icon: Icon, title, value, color, bgColor, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group"
    >
        <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h2>
            <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
    </motion.div>
);

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const DashboardContent = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadStats = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);
        
        setError(null);
        
        try {
            let data = await fetchStats();
            const raw = data.data || data.stats || data;

            // --- PROCESSAMENTO INTELIGENTE ---

            // 1. Processar Rankings por Missão primeiro (Fonte de Verdade)
            const rawMissionRankings = raw.missionRankings || raw.mission_rankings || raw.rankings || [];
            
            const missionRankings = Array.isArray(rawMissionRankings) ? rawMissionRankings.map(m => {
                // Tenta encontrar o líder em várias estruturas
                let leader = m.topUser || m.winner || m.leader || m.usuario;
                
                // Estratégias de fallback para encontrar o líder
                if (!leader && Array.isArray(m.ranking) && m.ranking.length > 0) leader = m.ranking[0];
                if (!leader && (m.user_name || m.nome_usuario || m.userName)) leader = m;

                const normalizedLeader = leader ? {
                    name: leader.nome || leader.name || leader.usuario || leader.user_name || leader.userName || 'Anônimo',
                    points: Number(leader.pontos ?? leader.points ?? leader.score ?? leader.xp ?? m.pontos ?? m.points ?? 0),
                    avatar: leader.foto_url || leader.avatar || leader.image || null
                } : { name: 'Sem dados', points: 0, avatar: null };

                return {
                    id: m.id || m.missao_id || Math.random(),
                    title: m.titulo || m.title || m.mission_title || "Missão",
                    topUser: normalizedLeader
                };
            }).filter(m => m.topUser && m.topUser.points > 0) : []; 

            // 2. Processar Top User Geral
            let rawTopUser = raw.topUser || raw.top_user || raw.leader || raw.ranking_first;
            if (!rawTopUser && Array.isArray(raw.ranking) && raw.ranking.length > 0) rawTopUser = raw.ranking[0];
            
            const topUser = rawTopUser ? {
                name: rawTopUser.nome || rawTopUser.name || rawTopUser.usuario || 'Nenhum',
                points: Number(rawTopUser.pontos_totais ?? rawTopUser.totalPoints ?? rawTopUser.pontos ?? rawTopUser.points ?? 0),
                avatar: rawTopUser.foto_url || rawTopUser.avatar || rawTopUser.image || null
            } : { name: 'Nenhum', points: 0, avatar: null };

            // 3. HEURÍSTICA DE CORREÇÃO (Crucial para o seu caso)
            // Se o Top User tem 0 pontos (bug do banco), tentamos reconstruir somando as missões
            if (topUser.points === 0 && topUser.name !== 'Nenhum') {
                // Procura o mesmo usuário nas missões e soma os pontos
                const pointsFromMissions = missionRankings
                    .filter(m => m.topUser.name === topUser.name)
                    .reduce((acc, m) => acc + m.topUser.points, 0);
                
                // Se encontrou pontos nas missões, usa essa soma!
                if (pointsFromMissions > 0) {
                    topUser.points = pointsFromMissions;
                    // Se não tiver avatar no global, tenta pegar da missão
                    if (!topUser.avatar) {
                        const missionWithAvatar = missionRankings.find(m => m.topUser.name === topUser.name && m.topUser.avatar);
                        if (missionWithAvatar) topUser.avatar = missionWithAvatar.topUser.avatar;
                    }
                }
            }

            const normalizedData = {
                totalMissions: Number(raw.totalMissions ?? raw.total_missions ?? raw.missions_count ?? 0),
                completedMissions: Number(raw.completedMissions ?? raw.completed_missions ?? 0),
                averageCompletion: Number(raw.averageCompletion ?? raw.average_completion ?? raw.completion_rate ?? 0),
                totalUsers: Number(raw.totalUsers ?? raw.total_users ?? raw.users_count ?? 0),
                topUser,
                missionRankings
            };

            setStats(normalizedData);

        } catch (err) {
            console.error("Erro no dashboard:", err);
            if (!isSilent) setError(`Erro ao carregar dados: ${err.message}`);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
        const intervalId = setInterval(() => loadStats(true), 5000);
        return () => clearInterval(intervalId);
    }, [loadStats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader size={40} className="animate-spin text-[#394C97] mb-4" /> 
                <p className="text-gray-500 font-medium">Sincronizando dados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3 text-center max-w-2xl mx-auto mt-10">
                    <AlertTriangle size={32} />
                    <span className="font-semibold text-lg">Não foi possível carregar o dashboard</span>
                    <span className="text-sm opacity-80">{error}</span>
                    <button onClick={() => loadStats(false)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                        <RefreshCw size={16} /> Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR --- */}
            <div className="h-64 w-full bg-[#394C97] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FE5900] opacity-10 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6 text-white w-full justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                                <LayoutDashboard className="w-8 h-8 text-[#FE5900]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Visão Geral</h1>
                                    {isRefreshing && <Loader size={20} className="animate-spin text-white/50" />}
                                </div>
                                <p className="text-blue-100/90 text-lg mt-1 font-light">Métricas de desempenho em tempo real</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => loadStats(true)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                            title="Atualizar agora"
                        >
                            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* 1. GRID DE ESTATÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard icon={Target} title="Missões Criadas" value={stats?.totalMissions ?? 0} color="text-blue-600" bgColor="bg-blue-50" delay={0.1} />
                    <StatsCard icon={CheckCircle} title="Missões Concluídas" value={stats?.completedMissions ?? 0} color="text-emerald-600" bgColor="bg-emerald-50" delay={0.2} />
                    <StatsCard icon={TrendingUp} title="Taxa de Conclusão" value={`${Math.round(stats?.averageCompletion ?? 0)}%`} color="text-amber-500" bgColor="bg-amber-50" delay={0.3} />
                    <StatsCard icon={Users} title="Usuários Ativos" value={stats?.totalUsers ?? 0} color="text-indigo-600" bgColor="bg-indigo-50" delay={0.4} />
                </div>

                {/* 2. ÁREA SECUNDÁRIA (RANKINGS) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* TOP USER GERAL */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 flex flex-col"
                    >
                        <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-6 text-white relative overflow-hidden">
                            <Trophy className="absolute -right-6 -bottom-6 w-40 h-40 text-white opacity-10 rotate-12" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Trophy size={18} /> Top Aventureiro Geral
                                </h3>
                                <p className="text-white/80 text-xs mt-1 uppercase tracking-wide font-medium">Maior Pontuação Acumulada</p>
                            </div>
                        </div>
                        
                        <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
                            {stats?.topUser?.name && stats.topUser.name !== 'Nenhum' ? (
                                <>
                                    <div className="w-24 h-24 bg-gray-50 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-gray-300 border-4 border-amber-100 shadow-inner relative overflow-hidden">
                                        {stats.topUser.avatar ? (
                                            <img src={stats.topUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            stats.topUser.name.charAt(0).toUpperCase()
                                        )}
                                        <div className="absolute bottom-0 right-0 bg-[#FE5900] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-bold shadow-sm z-10">1º</div>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 line-clamp-1">{stats.topUser.name}</h4>
                                    <div className="mt-3 inline-flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-[#394C97]">{stats.topUser.points}</span>
                                        <span className="text-sm text-gray-400 font-medium">pts</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Users size={48} className="mb-2 opacity-20" />
                                    <p>Ainda sem ranking</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* LÍDERES POR MISSÃO */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-[#394C97] flex items-center gap-2">
                                <Medal size={20} /> Destaques por Missão
                            </h3>
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Campeões (Em Tempo Real)</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[300px]">
                            {stats?.missionRankings && stats.missionRankings.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.missionRankings.map((mission, index) => (
                                        <div key={mission.id || index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-md transition-all group">
                                            {/* Avatar do Vencedor da Missão */}
                                            <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 shadow-sm shrink-0 overflow-hidden">
                                                {mission.topUser.avatar ? (
                                                    <img src={mission.topUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    (mission.topUser.name || '?').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
                                                    {mission.title}
                                                </p>
                                                <p className="text-base font-bold text-gray-800 truncate flex items-center gap-2">
                                                    {mission.topUser.name}
                                                    {index === 0 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded">HOT</span>}
                                                </p>
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="text-lg font-black text-[#FE5900]">
                                                    {mission.topUser.points}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium">XP Obtido</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                    <BarChart2 size={48} className="mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Nenhum ranking de missão disponível</p>
                                    <p className="text-xs opacity-60 mt-1">Aguardando conclusões de tarefas.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default DashboardContent;