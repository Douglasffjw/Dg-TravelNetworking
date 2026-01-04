import React from 'react';
import { Calendar, MapPin, CheckCircle, Lock, Award } from 'lucide-react';

const MissionCard = ({ mission, onClick }) => {
    // (log de depuração removido)
    // 1. Tratamento robusto da Imagem
    const displayImage = mission.image || mission.imageUrl || mission.foto_url;

    // 2. Tratamento robusto do Status de Inscrição (Agressivo)
    const statusLower = String(mission.status || '').toLowerCase().trim();
    const participationStatus = String(mission.status_participacao || mission.statusParticipacao || '').toLowerCase().trim();
    
    // Lista de termos que indicam que o utilizador tem acesso à missão
    const activeTerms = [
        'inscrito', 'participando', 'matriculado', 'joined', 
        'confirmado', 'em andamento', 'active', 'concluída', 
        'concluida', 'completed', 'finalizada'
    ];

    // Verifica se há respostas de quiz (indica participação ativa)
    const hasQuizAnswers = 
        (Array.isArray(mission.respostas) && mission.respostas.length > 0) ||
        (Array.isArray(mission.quiz?.respostas) && mission.quiz.respostas.length > 0);

    const isUserJoined = 
        mission.isJoined === true || 
        mission.isJoined === 'true' || 
        mission.isJoined === 1 || 
        mission.isJoined === '1' ||
        activeTerms.includes(statusLower) ||
        activeTerms.includes(participationStatus) ||
        hasQuizAnswers || // Nova verificação: se respondeu algo, está inscrito
        Boolean(mission.user_mission_id) || 
        Boolean(mission.subscription_id);

    // 3. Tratamento robusto dos Pontos (LÓGICA DE OURO - Soma das Tarefas e Perguntas do Quiz)
    const tasksArray = 
        (Array.isArray(mission.tarefas) && mission.tarefas) || 
        (Array.isArray(mission.tasks) && mission.tasks) || 
        (Array.isArray(mission.steps) && mission.steps) || 
        (mission.quiz?.questions) || 
        (mission.quiz?.perguntas) || // Suporte explícito a perguntas do quiz
        [];
    
    // Prioriza valor calculado no backend (`totalPoints`) quando disponível
    let backendTotal = Number(mission.totalPoints ?? mission.pontos ?? mission.points ?? 0);

    // Fallbacks extras: alguns lugares mantêm o objeto cru em `_raw`.
    if ((!backendTotal || backendTotal === 0) && mission._raw) {
        backendTotal = Number(mission._raw.totalPoints ?? mission._raw.pontos ?? mission._raw.points ?? 0) || backendTotal;
        // Se ainda nada, some as tarefas dentro do _raw
        if ((!backendTotal || backendTotal === 0) && Array.isArray(mission._raw.tarefas)) {
            backendTotal = mission._raw.tarefas.reduce((acc, t) => acc + (Number(t.pontos || t.points || 0) || 0), 0);
        }
    }

    const calculatedPoints = tasksArray.reduce((acc, item) => {
        const val = Number(item.pontos || item.points || item.valor || item.xp || 0);
        return acc + (Number.isNaN(val) ? 0 : val);
    }, 0);

    // Ordem de prioridade: backendTotal (quando fornecido) -> cálculo local -> estático
    const staticPoints = Number(mission.pontos || mission.points || 0);
    const displayPoints = backendTotal > 0 ? backendTotal : (calculatedPoints > 0 ? calculatedPoints : (Number.isNaN(staticPoints) ? 0 : staticPoints));

    const { 
        title, 
        titulo, 
        category, 
        deadline, 
        data_fim, 
        progress = 0
    } = mission;

    const displayTitle = title || titulo || "Missão Sem Título";
    const categoryName = (typeof category === 'object' ? category?.nome : category) || 'Geral';
    const displayDeadline = deadline || (data_fim ? new Date(data_fim).toLocaleDateString('pt-BR') : 'Sem prazo');
    const displayDesc = mission.description || mission.descricao || "Toque para ver detalhes";

    // Define label e ícone com base no estado
    let statusBadge;
    if (isUserJoined) {
        statusBadge = (
            <span className="bg-green-100/95 backdrop-blur text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-green-200 uppercase tracking-wide">
                <CheckCircle size={10} /> INSCRITO
            </span>
        );
    } else {
        statusBadge = (
            <span className="bg-gray-900/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/20 uppercase tracking-wide">
                <Lock size={10} /> DISPONÍVEL
            </span>
        );
    }

    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border p-0 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col h-full ${isUserJoined ? 'border-[#006494] ring-1 ring-[#006494]/20' : 'border-gray-100'}`}
        >
            {/* Área da Imagem de Capa */}
            <div className="h-44 w-full relative bg-gray-100 overflow-hidden">
                {displayImage ? (
                    <img 
                        src={displayImage} 
                        alt={displayTitle} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-200">
                        <MapPin size={48} />
                    </div>
                )}

                {/* Badge de Status */}
                <div className="absolute top-3 right-3 z-10">
                    {statusBadge}
                </div>

                 {/* Badge de Pontos */}
                 <div className="absolute bottom-3 left-3 z-10">
                     <span className="bg-white/90 backdrop-blur text-[#986dff] text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <Award size={10} /> {displayPoints} XP
                     </span>
                 </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {categoryName}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#006494] transition-colors mb-2 leading-tight">
                    {displayTitle}
                </h3>

                <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">
                    {displayDesc}
                </p>

                {/* Barra de Progresso (se inscrito) ou Data (se não inscrito) */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    {isUserJoined ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                                <span>Progresso</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#006494] rounded-full transition-all duration-500" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center text-xs text-gray-400 font-medium">
                            <Calendar size={12} className="mr-1.5" /> 
                            Expira em: {displayDeadline}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionCard;