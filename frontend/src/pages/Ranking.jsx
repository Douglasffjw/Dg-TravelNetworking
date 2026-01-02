import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Search, Crown, Medal, User, Loader, AlertTriangle, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";
import api from "../api/api";

export default function Ranking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rankingData, setRankingData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rankingRes, userRes] = await Promise.all([
            api.get("/ranking"), 
            api.get("/auth/me")
        ]);

        const backendData = rankingRes.data || [];
        const loggedUser = userRes.data;

        const formattedRanking = backendData.map(user => ({
            id: user.id,
            name: user.nome || user.name || "Sem Nome",
            points: user.pontos || user.points || 0,
            department: user.departamento || user.role || "Geral",
            avatar: user.foto_url || null,
            initials: getInitials(user.nome || user.name),
        })).sort((a, b) => b.points - a.points);

        setRankingData(formattedRanking);

        const userInRanking = formattedRanking.find(u => u.id === loggedUser.id);
        const rankPosition = formattedRanking.findIndex(u => u.id === loggedUser.id) + 1;

        setCurrentUser({
            ...loggedUser,
            name: loggedUser.nome,
            points: userInRanking ? userInRanking.points : (loggedUser.pontos || 0),
            rank: rankPosition > 0 ? rankPosition : "-",
            department: loggedUser.departamento || "Sem departamento",
            initials: getInitials(loggedUser.nome)
        });

      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
        setError("Não foi possível carregar o ranking. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const firstPlace = rankingData[0] || { name: "-", points: 0, initials: "-" };
  const secondPlace = rankingData[1] || { name: "-", points: 0, initials: "-" };
  const thirdPlace = rankingData[2] || { name: "-", points: 0, initials: "-" };
  const restOfListOriginal = rankingData.slice(3);

  const listData = restOfListOriginal.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRealRank = (userId) => {
    return rankingData.findIndex(u => u.id === userId) + 1;
  };

  // Renderização de Conteúdo
  const renderContent = () => {
    if (loading) {
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Loader size={40} className="animate-spin text-[#394C97] mb-4" /> 
              <p className="text-gray-500 font-medium">Calculando pontuações...</p>
          </div>
        );
    }

    if (error) {
        return (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3 text-center">
            <AlertTriangle size={32} />
            <span className="font-semibold text-lg">Ocorreu um erro</span>
            <span className="text-sm opacity-80">{error}</span>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
              <RefreshCw size={16} /> Tentar Novamente
            </button>
          </div>
        );
    }

    return (
        <>
            {/* BUSCA */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3"
            >
                <Search className="text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar participante..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>

            {/* PÓDIO */}
            {rankingData.length > 0 && !searchTerm && (
                <div className="flex justify-center items-end gap-3 md:gap-8 mb-12">
                    
                    {/* 2º LUGAR */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative mb-2">
                            {secondPlace.avatar ? (
                            <img src={secondPlace.avatar} alt={secondPlace.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-300 object-cover shadow-md" />
                            ) : (
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-lg shadow-md">{secondPlace.initials}</div>
                            )}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">2</div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-xs md:text-sm text-center max-w-[80px] truncate">{secondPlace.name}</h3>
                        <p className="text-[#394C97] font-bold text-sm">{secondPlace.points}</p>
                        <div className="w-20 md:w-28 h-24 md:h-28 bg-gradient-to-t from-gray-200 to-gray-50 rounded-t-lg border-x border-t border-gray-200 mt-2"></div>
                    </motion.div>

                    {/* 1º LUGAR */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center z-10 -mt-6"
                    >
                        <div className="relative mb-2">
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 drop-shadow-sm">
                                <Crown size={24} fill="currentColor" />
                            </div>
                            {firstPlace.avatar ? (
                            <img src={firstPlace.avatar} alt={firstPlace.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 object-cover shadow-lg ring-2 ring-yellow-100" />
                            ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center font-bold text-yellow-600 text-2xl shadow-lg ring-2 ring-yellow-100">{firstPlace.initials}</div>
                            )}
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm">1</div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm md:text-base text-center max-w-[120px] truncate mt-1">{firstPlace.name}</h3>
                        <p className="text-yellow-600 font-extrabold text-lg">{firstPlace.points}</p>
                        <div className="w-24 md:w-36 h-32 md:h-40 bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-lg border-x border-t border-yellow-200 mt-2 relative overflow-hidden">
                             <div className="absolute inset-0 bg-white opacity-30 bg-gradient-to-tr from-transparent via-white to-transparent transform rotate-45 translate-y-full animate-pulse"></div>
                        </div>
                    </motion.div>

                    {/* 3º LUGAR */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative mb-2">
                            {thirdPlace.avatar ? (
                            <img src={thirdPlace.avatar} alt={thirdPlace.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-orange-300 object-cover shadow-md" />
                            ) : (
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-orange-300 bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-lg shadow-md">{thirdPlace.initials}</div>
                            )}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">3</div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-xs md:text-sm text-center max-w-[80px] truncate">{thirdPlace.name}</h3>
                        <p className="text-[#394C97] font-bold text-sm">{thirdPlace.points}</p>
                        <div className="w-20 md:w-28 h-16 md:h-20 bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-lg border-x border-t border-orange-200 mt-2"></div>
                    </motion.div>
                </div>
            )}

            {/* LISTA DE RANKING */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="col-span-2 md:col-span-1 text-center">#</div>
                    <div className="col-span-7 md:col-span-7 text-left pl-2">Participante</div>
                    <div className="col-span-3 md:col-span-4 text-right pr-2">Pontos</div>
                </div>

                <div className="divide-y divide-gray-50">
                    {listData.length > 0 ? (
                        listData.map((user, index) => (
                            <motion.div 
                                key={user.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`grid grid-cols-12 items-center p-4 transition-colors ${user.id === currentUser?.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                            >
                                <div className="col-span-2 md:col-span-1 text-center">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${user.id === currentUser?.id ? 'bg-blue-200 text-blue-800' : 'text-gray-500'}`}>
                                        {getRealRank(user.id)}
                                    </span>
                                </div>
                                
                                <div className="col-span-7 md:col-span-7 flex items-center gap-3 pl-2">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold border border-gray-200">
                                            {user.initials}
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <h4 className={`font-bold text-sm truncate ${user.id === currentUser?.id ? 'text-[#394C97]' : 'text-gray-700'}`}>
                                            {user.name} {user.id === currentUser?.id && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1 font-normal">Você</span>}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 uppercase truncate flex items-center gap-1">
                                            {user.department}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-span-3 md:col-span-4 text-right pr-2 font-bold text-gray-700">
                                    {user.points}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                            <User size={40} className="mb-2 opacity-20" />
                            <p>Nenhum participante encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <Navbar />

      {/* --- BANNER SUPERIOR --- */}
      <div className="h-64 w-full bg-[#394C97] relative pt-[50px]">
        <div className="absolute top-4 right-4 text-white/80 text-sm font-medium hidden md:block mt-[50px]">
          Temporada Atual
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pb-12 md:translate-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-white"
          >
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Trophy className="w-10 h-10 text-[#FE5900]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Líderes da Temporada</h1>
              <p className="text-blue-100 text-lg mt-1">Os maiores pontuadores em tempo real</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Sobreposto) --- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {renderContent()}
      </div>

      {/* FOOTER FIXO (USUÁRIO LOGADO) */}
      {currentUser && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] py-3 px-4 md:px-8 z-50"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#394C97] text-white font-bold text-sm w-10 h-10 flex flex-col items-center justify-center rounded-xl leading-tight shadow-md ring-2 ring-blue-100">
                  <span className="text-[9px] uppercase opacity-70">Pos</span>
                  <span>{currentUser.rank}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{currentUser.name} (Você)</h4>
                  <p className="text-xs text-gray-500">{currentUser.department}</p>
                </div>
              </div>
              <div className="text-right">
                  <div className="text-xl md:text-2xl font-black text-[#394C97] leading-none">
                  {currentUser.points} <span className="text-xs font-normal text-gray-400">pts</span>
                </div>
              </div>
            </div>
          </motion.div>
      )}

      <FeedbackBar />
    </div>
  );
}