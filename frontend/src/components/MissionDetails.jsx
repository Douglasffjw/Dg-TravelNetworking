import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  Briefcase, MapPin, Clock, Trophy, ArrowLeft, Loader, CheckCircle, Lock, PlayCircle, AlertCircle, LogOut, Award, User
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import TaskDetailsModal from './missions/TaskDetailsModal';

// --- SUBCOMPONENTES ---

const TaskItem = ({ task, onClick, isLocked, isCompleted }) => (
    <div 
        onClick={() => !isLocked && onClick && onClick(task)}
        className={`relative bg-white p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group 
            ${isLocked 
                ? 'opacity-60 cursor-not-allowed border-gray-100 bg-gray-50' 
                : 'cursor-pointer hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 border-gray-100'
            }
            ${isCompleted ? 'border-l-4 border-l-green-500' : ''}
        `}
    >
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full shadow-sm ${isCompleted ? 'bg-green-100 text-green-600' : (isLocked ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600')}`}>
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : (isLocked ? <Lock className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />)}
            </div>
            <div>
                <h4 className={`font-bold text-lg transition-colors ${isLocked ? 'text-gray-500' : 'text-gray-800 group-hover:text-[#006494]'}`}>
                    {task.titulo}
                </h4>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide">{task.categoria?.nome || 'Geral'}</span>
                    <span>•</span>
                    <span className="font-semibold text-orange-500">{task.pontos} XP</span>
                </p>
            </div>
        </div>
        {isCompleted && <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">Concluída</span>}
    </div>
);

const MissionRanking = ({ rankingData }) => {
    if (!rankingData || rankingData.length === 0) return null;
    const maxPoints = Math.max(...rankingData.map(item => item.points));

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8" data-aos="fade-up">
            <div className="flex items-center text-lg font-bold text-gray-900 mb-6 border-b pb-3">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                Ranking da Missão
            </div>
            <div className="space-y-4">
                {rankingData.map((item, index) => {
                    const progressWidth = maxPoints > 0 ? Math.round((item.points / maxPoints) * 100) : 0;
                    const isCurrentUser = item.isCurrentUser;
                    
                    return (
                        <div key={item.id} className="relative">
                            <div className="flex items-center justify-between mb-1 z-10 relative">
                                <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {index + 1}
                                    </span>
                                    <span className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {isCurrentUser && '(Você) '}
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-gray-500">{item.points} pts</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${isCurrentUser ? 'bg-blue-500' : 'bg-green-500'}`} 
                                    style={{ width: `${progressWidth}%` }} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function MissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado inicial pode vir da navegação (Home) para renderizar rápido
  const initialData = location.state?.missionData;

  const [missionData, setMissionData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState(null);

  // --- BUSCA DADOS COMPLETOS (API) ---
  const fetchFullDetails = useCallback(async () => {
    if (!id) return;
    // Só mostra loading se não tiver dados nenhuns
    if (!missionData) setLoading(true);
    
    try {
      const res = await api.get(`/missions/${id}/full`);
      setMissionData(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
      if (!missionData) setError("Não foi possível carregar a missão.");
    } finally {
      setLoading(false);
    }
  }, [id, missionData]);

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.init({ duration: 900, once: false, offset: 50 });
    AOS.refresh();
    fetchFullDetails();
  }, [id]);

  // --- AÇÕES ---
  const handleJoin = async () => {
    if (!window.confirm("Deseja iniciar esta missão?")) return;
    setJoining(true);
    try {
        await api.post(`/missions/${id}/join`);
        // Atualização Otimista
        setMissionData(prev => ({
            ...prev,
            isJoined: true,
            userProgress: prev?.userProgress || { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} }
        }));
        await fetchFullDetails();
    } catch (err) {
        if (err.response?.status === 409) {
             setMissionData(prev => ({ ...prev, isJoined: true }));
             fetchFullDetails();
        } else {
            alert(err.response?.data?.error || "Erro ao se inscrever.");
        }
    } finally {
        setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Tem certeza? Seu progresso será perdido.")) return;
    setLeaving(true);
    try {
        await api.delete(`/missions/${id}/join`);
        setMissionData(prev => ({ ...prev, isJoined: false, userProgress: null }));
        await fetchFullDetails();
    } catch (err) {
        alert("Erro ao sair da missão.");
    } finally {
        setLeaving(false);
    }
  };

  const handleTaskClick = (task) => {
    if (!missionData?.isJoined) return;
    setSelectedTask(task);
  };

  // --- RENDERIZAÇÃO ---
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin w-10 h-10 text-[#006494]" /><span className="ml-3 text-lg text-gray-600">Carregando missão...</span></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-500"><AlertCircle className="w-12 h-12 mb-4"/><p className="text-xl">{error}</p><button onClick={() => navigate('/missions')} className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Voltar</button></div>;
  if (!missionData) return null;

  // Extração de dados
  const { 
    titulo, descricao, destino, data_fim, 
    pontos, foto_url, isJoined, userProgress, ranking, tarefas = [] 
  } = missionData;

  const tasksStatus = userProgress?.tasksStatus || {};
  const myTotalPoints = userProgress?.totalPoints || 0;
  const completedCount = userProgress?.completedTasksCount || 0;
  const totalTasks = tarefas.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  // Formatadores
  const formatDate = (dateString) => {
    if (!dateString) return "Sem data definida";
    return new Date(dateString).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        {foto_url ? (
            <img
              src={foto_url}
              alt={titulo}
              className="absolute w-full h-full object-cover grayscale brightness-[0.6]"
            />
        ) : (
            <div className="absolute w-full h-full bg-gradient-to-r from-[#1e293b] to-[#0f172a]" />
        )}
        
        <div className="absolute inset-0 flex items-end pb-12 px-6 md:px-20 text-white z-10" data-aos="fade-up">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-[#986dff] font-bold tracking-wider uppercase text-sm mb-2">
                <MapPin size={16} /> {destino}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight shadow-text mb-4">
              {titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#986dff]" />
                <span className="font-semibold">{pontos} Pontos</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Clock className="w-5 h-5" />
                <span className="text-base">Até {formatDate(data_fim)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUNA ESQUERDA (Principal) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* CARD DE STATUS / AÇÃO */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-[#006494]" data-aos="fade-up">
                {!isJoined ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pronto para o desafio?</h2>
                            <p className="text-gray-600">Inicie a missão para desbloquear as tarefas e começar a pontuar no ranking.</p>
                        </div>
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="whitespace-nowrap bg-[#006494] hover:brightness-90 text-white px-8 py-4 rounded-xl transition duration-300 shadow-lg font-bold uppercase tracking-wider flex items-center gap-2"
                        >
                            {joining ? <Loader className="animate-spin w-5 h-5"/> : <PlayCircle className="w-5 h-5" />}
                            Iniciar Missão
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-green-600"><CheckCircle className="w-6 h-6"/></span> 
                                    Missão em Andamento
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Você já acumulou <strong className="text-[#006494]">{myTotalPoints} XP</strong></p>
                            </div>
                            <button onClick={handleLeave} disabled={leaving} className="text-red-400 hover:text-red-600 text-sm font-semibold flex items-center gap-1 transition-colors">
                                <LogOut size={16}/> Sair
                            </button>
                        </div>
                        {/* Barra de Progresso */}
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                    Progresso
                                </span>
                                <span className="text-xs font-semibold inline-block text-blue-600">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-blue-100">
                                <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#006494] transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* LISTA DE TAREFAS */}
            <div data-aos="fade-up" data-aos-delay="100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" /> Tarefas da Missão
                </h3>
                
                <div className="space-y-4">
                    {tarefas.length > 0 ? (
                        tarefas.map(task => {
                            const status = tasksStatus[task.id];
                            return (
                                <TaskItem 
                                    key={task.id}
                                    task={task}
                                    isLocked={!isJoined}
                                    isCompleted={status?.concluida}
                                    onClick={handleTaskClick}
                                />
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">
                            Nenhuma tarefa cadastrada para esta missão.
                        </p>
                    )}
                </div>
            </div>

            {/* Descrição Detalhada */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100" data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Sobre esta Missão</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {descricao || "Sem descrição adicional."}
                </p>
            </div>

          </div>

          {/* COLUNA DIREITA (Lateral) */}
          <div className="lg:col-span-1 space-y-8">
             
             {/* Ficha Técnica */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100" data-aos="fade-left">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#006494]" /> Recompensas
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#006494]/10 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Trophy className="w-5 h-5 text-yellow-500" /></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">XP Total</p>
                            <p className="font-bold text-gray-800 text-lg">{pontos} pts</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* Ranking */}
             <MissionRanking rankingData={ranking} />

          </div>
        </div>
      </div>

      {/* Modal de Tarefa */}
      {selectedTask && isJoined && (
          <TaskDetailsModal
              task={selectedTask}
              status={tasksStatus[selectedTask.id]}
              onClose={() => setSelectedTask(null)}
              onComplete={() => {
                  fetchFullDetails();
                  setSelectedTask(null);
              }}
          />
      )}
      
    </div>
  );
}