import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"; 
import { Loader, AlertTriangle, Target, CheckCircle, List, Flag, RefreshCw } from "lucide-react"; 

// --- IMPORTAÇÕES REAIS (SEM MOCKS) ---
import MissionCard from "../components/missions/MissionCard";
import MissionDetails from "../components/missions/MissionDetails";
import { fetchMissions } from '../api/apiFunctions'; 

// ===================================================================
// FUNÇÃO DE NORMALIZAÇÃO DE DADOS (CORRIGIDA)
// ===================================================================
function normalizeMission(m) {
    if (!m) return null;

    const title = m.titulo || m.title || 'Sem Título';
    const description = m.descricao || m.description || '';
    const deadline = m.data_fim ? new Date(m.data_fim).toLocaleDateString('pt-BR') : (m.deadline || '');
    
    // Tratamento de imagem com fallback
    const image = m.foto_url || m.imageUrl || null;

    // 1. Processamento de Tarefas
    let tasks = [];
    const rawTasks = m.tarefas || m.steps || [];
    let calculatedCompletedTasks = 0;

    if (Array.isArray(rawTasks) && rawTasks.length > 0) {
        tasks = rawTasks.map(t => {
            const isCompleted = Boolean(t.concluida || t.completed);
            if (isCompleted) calculatedCompletedTasks++;
            
            return { 
                id: t.id, 
                name: t.titulo || t.descricao || t.description || '', 
                description: t.descricao || t.description || 'Detalhes indisponíveis.',
                points: Number(t.pontos || t.points || 0),
                completed: isCompleted, 
                status: isCompleted ? 'CONCLUÍDA' : 'PENDENTE',
                category: t.category || 'Geral'
            };
        });
    }

    const totalTasks = tasks.length;
    
    // 2. DETECÇÃO ROBUSTA DE INSCRIÇÃO (CRÍTICO)
    // Verifica bandeiras booleanas diretas
    const directFlag = Boolean(m.isJoined || m.inscrito || m.joined || m.participando || m.matriculado);
    
    // Verifica chaves estrangeiras ou IDs de relação (comum em SQL/Supabase)
    const relationId = Boolean(m.user_mission_id || m.subscription_id || m.matricula_id);
    
    // Verifica arrays de relação (ex: Supabase retorna user_missions: [{...}])
    const nestedRelation = Array.isArray(m.user_missions) && m.user_missions.length > 0;
    
    // Verifica se há progresso gravado (se existe progresso definido, existe relação)
    const backendProgress = m.progresso !== undefined && m.progresso !== null ? Number(m.progresso) : 0;
    const hasProgressData = m.progresso !== undefined && m.progresso !== null;

    // Verifica implicitamente se há tarefas concluídas
    const hasCompletedTasks = calculatedCompletedTasks > 0;

    // DECISÃO FINAL DE INSCRIÇÃO
    const isJoined = directFlag || relationId || nestedRelation || hasProgressData || hasCompletedTasks;

    // 3. CÁLCULO DE PROGRESSO
    let progress = 0;
    if (totalTasks > 0) {
        // Prioriza o cálculo real baseado nas tarefas carregadas
        progress = Math.round((calculatedCompletedTasks / totalTasks) * 100);
    } else if (backendProgress > 0) {
        // Fallback para o valor simples do banco se não houver tarefas detalhadas
        progress = backendProgress;
    }

    const accumulatedPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
    // Se não vierem tarefas detalhadas do backend, usar os valores agregados
    const backendTotalPoints = Number(m.totalPoints ?? m.pontos ?? m.points ?? 0);
    const backendUserPoints = Number(m.userPoints ?? m.user_points ?? 0);
    const finalAccumulatedPoints = tasks.length > 0 ? accumulatedPoints : (backendUserPoints || 0);
    
    // 4. DEFINIÇÃO DE STATUS
    let status = 'Disponível';
    
    // Normaliza status do banco se vier como string
    const dbStatus = m.status ? String(m.status).toLowerCase() : '';

    if (progress === 100 || dbStatus === 'concluida' || dbStatus === 'completed') {
        status = 'Concluída';
    } else if (isJoined) {
        status = 'Inscrito';
    }

    // 5. DEFINIÇÃO DE ATIVA
    // Se o user já estiver inscrito, consideramos ativa para ele ver na lista, mesmo que 'ativa' seja false no banco
    const isActive = (m.ativa === undefined || m.ativa === null) ? true : Boolean(m.ativa);

    return {
        id: m.id,
        title,
        description,
        deadline,
        totalTasks,
      completedTasks: calculatedCompletedTasks,
      accumulatedPoints: finalAccumulatedPoints,
      pontos: backendTotalPoints,
      points: backendTotalPoints,
        totalPoints: backendTotalPoints,
        progress,
        status, // 'Disponível', 'Inscrito', ou 'Concluída'
        tasks,
        category: m.destino || 'Geral', 
        ativa: isActive,
        image, 
        isJoined 
    };
}

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const location = useLocation();
  const navigate = useNavigate();

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMissions();
      
      // Normaliza e Filtra
      const normalized = (data || [])
        .map(normalizeMission)
        .filter(m => m !== null) // Remove nulos
        // Lógica de visualização:
        // Mostra se a missão está ativa (para novos users)
        // OU se o utilizador atual já está inscrito (isJoined === true), independentemente de estar ativa
        .filter(m => m.ativa === true || m.isJoined === true);
      
      setMissions(normalized);
      // (log temporário removido)
    } catch (err) {
      const msg = err.response?.status === 403 || err.response?.status === 401 
        ? "Sessão expirada. Por favor, faça login novamente."
        : err.message || 'Erro de conexão ao buscar missões.';
        
      setError(msg);
      console.error("Erro ao carregar missões:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // Sincroniza aba com query param `tab` para persistir seleção no reload
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'active' || tab === 'completed') {
      setActiveTab(tab);
    }
  // somente executar quando mudar a localização (ex.: reload ou navegação externa)
  }, [location.search]);

  // Atualiza a URL quando a aba muda (sem empurrar histórico)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (activeTab) params.set('tab', activeTab);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    } catch (e) {
      // ignore
    }
  }, [activeTab, location.pathname, location.search, navigate]);
  
  const filteredMissions = missions.filter(mission => {
    if (activeTab === 'active') {
      // Aba 'Ativas': Missões não concluídas (seja inscrito ou apenas disponível)
      return mission.progress < 100 && mission.status !== 'Concluída';
    } 
    else if (activeTab === 'completed') {
      // Aba 'Concluídas': Apenas 100% ou status explícito
      return mission.progress === 100 || mission.status === 'Concluída';
    }
    return true;
  });

  const handleOpenMission = (mission) => setSelectedMission(mission);
  
  // Função crítica: Recarrega dados ao voltar dos detalhes para atualizar o status
  const handleBackToMissions = async () => {
      setSelectedMission(null);
      await loadMissions();
  };
  
  const handleCompleteStep = (taskId) => {
    // Log para debug
    console.log(`Tarefa ${taskId} concluída na UI.`);
  };

  // Renderização Condicional de Conteúdo
  const renderContent = () => {
    if (loading && !selectedMission) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader size={40} className="animate-spin text-[#006494] mb-4" /> 
            <p className="text-gray-500 font-medium">Sincronizando missões...</p>
        </div>
      );
    }

    if (error && !selectedMission) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={32} />
          <span className="font-semibold text-lg">Não foi possível carregar</span>
          <span className="text-sm opacity-80">{error}</span>
          <button onClick={loadMissions} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (selectedMission) {
       return (
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
         >
            <MissionDetails
                mission={selectedMission}
                onBack={handleBackToMissions}
                onCompleteStep={handleCompleteStep}
            />
         </motion.div>
       );
    }

    return (
      <>
        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 inline-flex">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'active' 
                        ? 'bg-[#006494] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <Target size={16} />
                    Missões Ativas
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'completed' 
                        ? 'bg-[#006494] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <CheckCircle size={16} />
                    Concluídas
                </button>
            </div>
        </div>

        {/* LISTA DE MISSÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.length > 0 ? (
                filteredMissions.map((mission, index) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <MissionCard
                            mission={mission}
                            onClick={() => handleOpenMission(mission)} 
                        />
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="p-4 bg-gray-50 rounded-full mb-3">
                        {activeTab === 'active' ? <List size={30} className="text-gray-400"/> : <Flag size={30} className="text-gray-400"/>}
                    </div>
                    <p className="text-gray-500 font-medium">
                        {activeTab === 'active' ? 'Nenhuma missão ativa no momento.' : 'Nenhuma missão concluída ainda.'}
                    </p>
                    <button onClick={loadMissions} className="mt-4 text-[#006494] text-sm flex items-center gap-1 hover:underline">
                        <RefreshCw size={12} /> Atualizar lista
                    </button>
                </div>
            )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- BANNER SUPERIOR --- */}
      <div className="h-64 w-full bg-[#006494] relative">
        <div className="absolute top-4 right-4 text-white/80 text-sm font-medium">
          Central de Operações
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pb-12 md:translate-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-white"
          >
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Target className="w-10 h-10 text-[#986dff]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Suas Missões</h1>
              <p className="text-blue-100 text-lg mt-1">Complete objetivos para subir de nível</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Sobreposto) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20 relative z-10">
         {renderContent()}
      </div>

    </div>
  );
}