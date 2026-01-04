import React from 'react';
import { Edit, Trash2, Calendar, MapPin, Trophy, Users } from 'lucide-react';

const MissionCard = ({ mission, onEdit, onDelete, onManageParticipants }) => {
    // CORREÇÃO: Verifica todas as possíveis origens da imagem
    // imageUrl: vem do estado local/edição
    // foto_url: vem do banco de dados (backend)
    // image: vem da normalização do frontend
    const displayImage = mission.imageUrl || mission.foto_url || mission.image;

    // Garante números válidos
    const price = mission.preco ? Number(mission.preco) : 0;
    const vacancies = mission.vagas_disponiveis;

    // Pontos: prioriza `totalPoints` retornado pelo backend, com fallbacks
    let backendTotal = Number(mission.totalPoints ?? mission.pontos ?? mission.points ?? 0);
    // Fallback para _raw (algumas respostas mantêm objeto cru)
    if ((!backendTotal || backendTotal === 0) && mission._raw) {
        backendTotal = Number(mission._raw.totalPoints ?? mission._raw.pontos ?? mission._raw.points ?? backendTotal) || backendTotal;
        if ((!backendTotal || backendTotal === 0) && Array.isArray(mission._raw.tarefas)) {
            backendTotal = mission._raw.tarefas.reduce((acc, t) => acc + (Number(t.pontos || t.points || 0) || 0), 0);
        }
    }
    const stepsArray = Array.isArray(mission.steps) ? mission.steps : (Array.isArray(mission.tarefas) ? mission.tarefas : []);
    const calculatedPoints = stepsArray.reduce((s, it) => s + (Number(it.points || it.pontos || 0) || 0), 0);
    const displayPoints = backendTotal > 0 ? backendTotal : (calculatedPoints > 0 ? calculatedPoints : Number(mission.points || mission.pontos || 0));

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden flex flex-col h-full relative"
        >
            
            {/* Área da Imagem de Capa */}
            <div className="h-44 w-full relative bg-gray-100 overflow-hidden">
                {displayImage ? (
                    <img 
                        src={displayImage} 
                        alt={mission.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.style.display = 'none'; // Oculta se quebrar
                            e.target.nextSibling.style.display = 'flex'; // Mostra fallback (se implementado via CSS irmão, mas aqui usamos condicional JS acima)
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-200">
                        <MapPin size={48} />
                    </div>
                )}
                
                {/* Badges Administrativos (Preço e Vagas) */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {price > 0 && (
                        <span className="bg-white/90 backdrop-blur text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-green-100">
                            R$ {price.toFixed(2)}
                        </span>
                    )}
                    {(vacancies !== null && vacancies !== undefined) && (
                        <span className="bg-white/90 backdrop-blur text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-blue-100">
                            {vacancies} Vagas
                        </span>
                    )}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {mission.city || mission.destino || 'Geral'}
                    </span>
                </div>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-[#006494] transition-colors" title={mission.title}>
                        {mission.title}
                    </h3>
                </div>

                <div className="flex items-center text-xs text-gray-500 mb-4 gap-3">
                    <span className="flex items-center gap-1">
                        <Trophy size={14} className="text-[#986dff]" /> 
                        <span className="font-semibold">{displayPoints} XP</span>
                    </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                    {mission.descricao || "Sem descrição definida."}
                </p>

                {/* Rodapé com Ações Administrativas */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                        <Calendar size={12} />
                        {mission.expirationDate 
                            ? new Date(mission.expirationDate).toLocaleDateString() 
                            : (mission.data_fim ? new Date(mission.data_fim).toLocaleDateString() : 'Sem data')}
                    </span>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onManageParticipants(); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Gerenciar Participantes"
                        >
                            <Users size={16} />
                        </button>

                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-2 text-gray-400 hover:text-[#006494] hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            title="Editar Missão"
                        >
                            <Edit size={16} />
                        </button>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Excluir Missão"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionCard;