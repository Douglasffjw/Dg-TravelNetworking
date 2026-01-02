import React from 'react';
import {
    CheckCircle,
    Repeat,
    Upload,
    Edit,
    MessageSquare,
    Zap,
    FileText,
    Trello,
    ListChecks
} from 'lucide-react';

// ===================================================================
// FUNÇÕES AUXILIARES (Definidas aqui, pois são usadas apenas neste componente)
// ===================================================================

/**
 * Retorna as classes CSS do Tailwind para o rótulo de status.
 */
const getStatusClasses = (status) => {
    switch (status) {
        case 'CONCLUÍDA':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'PENDENTE':
            return 'text-orange-600 bg-orange-50 border-orange-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

/**
 * Retorna o componente de ícone correto com base no nome e status da tarefa.
 */
const getTaskIcon = (taskName, category, isCompleted) => {
    if (isCompleted) return CheckCircle;
    if (taskName.includes('Quiz')) return ListChecks;
    if (taskName.includes('Flashcards')) return Repeat;
    if (taskName.includes('Envio: Documento')) return Upload;
    if (taskName.includes('Formulário de Feedback')) return Edit;
    if (taskName.includes('LinkedIn') || taskName.includes('Comentar')) return MessageSquare;

    switch (category) {
        case 'Conhecimento': return Zap;
        case 'Administrativas': return FileText;
        case 'Engajamento': return MessageSquare;
        default: return Trello;
    }
};

// ===================================================================
// COMPONENTE TaskItem
// ===================================================================

const TaskItem = ({ task, onTaskClick }) => {
    const IconComponent = getTaskIcon(task.name, task.category, task.status === 'CONCLUÍDA');
    const statusClasses = getStatusClasses(task.status);
    const isCompleted = task.status === 'CONCLUÍDA';

    // Classes para hover e cursor, ativadas apenas se a tarefa não estiver concluída
    const interactionClasses = isCompleted ? '' : 'hover:bg-gray-100 cursor-pointer';

    return (
        <div
            className={`flex justify-between items-start p-4 mb-3 border-l-4 rounded-lg transition-all duration-200 ${isCompleted ? 'border-green-400 bg-green-50/50' : 'border-gray-200 ' + interactionClasses
                }`}
            // Chama a função passada pelo MissionDetails ao clicar na tarefa
            onClick={() => onTaskClick(task)}
        >
            {/* Ícone e Detalhes da Tarefa */}
            <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isCompleted ? 'bg-green-100' : 'bg-gray-100 text-gray-700'}`}>
                    <IconComponent className="w-6 h-6" />
                </div>
                <div className="min-w-0 overflow-hidden">
                    <h4 className={`font-semibold text-lg truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {task.name}
                    </h4>
                    <p className={`text-sm truncate ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                </div>
            </div>

            {/* Pontos e Status */}
            <div className="flex flex-col items-end whitespace-nowrap ml-4 flex-shrink-0">
                <span className={`font-bold text-lg ${isCompleted ? 'text-gray-400' : 'text-orange-500'}`}>
                    {task.points} pts
                </span>
                <span
                    className={`text-xs font-semibold px-2 py-0.5 mt-1 rounded-full border ${statusClasses}`}
                >
                    {task.status}
                </span>
            </div>
        </div>
    );
};

export default TaskItem;