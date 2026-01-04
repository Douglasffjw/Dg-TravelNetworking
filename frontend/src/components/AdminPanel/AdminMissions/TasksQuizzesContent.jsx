import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Briefcase, 
    Plus, 
    Loader, 
    AlertTriangle, 
    Edit, 
    Trash2, 
    Tag, 
    ListChecks, 
    FileText, 
    CheckSquare, 
    Trophy,
    RefreshCw,
    Filter,
    Map, Camera
} from "lucide-react";
import { fetchTasks, fetchTaskById, fetchQuizzes, createTask, updateTask, deleteTask, fetchCategories, fetchMissions } from '../../../api/apiFunctions'; 
import TaskQuizModal from './TaskQuizModal'; 

const INITIAL_TASK_STATE = {
    missao_id: null, 
    categoria_id: null, 
    titulo: "",
    descricao: "",
    instrucoes: "",
    pontos: 0,
    tipo: 'padrao', // Default
    dificuldade: 'facil',
    ordem: 0,
    ativa: true,
    requisitos: null,
    tarefa_anterior_id: null,
    quiz: null,
};

const TasksQuizzesContent = () => {
    // ESTADOS DE DADOS
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [missionsList, setMissionsList] = useState([]);
    
    // ESTADOS DE FLUXO
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // FILTROS
    const [selectedMissionId, setSelectedMissionId] = useState("");

    // ESTADOS DE CRIAÇÃO/EDIÇÃO
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTask, setCurrentTask] = useState(INITIAL_TASK_STATE);

    // --- FUNÇÕES DE CARREGAMENTO ---

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [tasksData, categoriesData] = await Promise.all([
                fetchTasks(),
                fetchCategories() 
            ]);
            // O backend utiliza soft-delete (ativa = false). 
            setTasks(Array.isArray(tasksData) ? tasksData.filter(t => t.ativa !== false) : []);
            setCategories(categoriesData);
        } catch (err) {
            setError(`Falha ao carregar dados: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar Tarefas/Categorias:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        (async () => {
            try {
                const ms = await fetchMissions();
                setMissionsList(ms);
            } catch (err) {
                console.warn('Não foi possível carregar missões para o modal:', err?.message || err);
            }
        })();
    }, []);

    // --- HANDLERS ---

    const handleModalOpen = async (taskToEdit = null) => {
        if (taskToEdit) {
            setIsEditing(true);
            try {
                const fresh = await fetchTaskById(taskToEdit.id);
                // Deep copy para edição segura
                let taskCopy = JSON.parse(JSON.stringify(fresh || taskToEdit));
                
                // Fallback: Se o quiz não vier aninhado, tenta buscar separadamente
                if (!taskCopy.quiz) {
                    try {
                        const allQuizzes = await fetchQuizzes();
                        const found = Array.isArray(allQuizzes) ? allQuizzes.find(q => Number(q.tarefa_id) === Number(taskCopy.id) || (q.tarefa && Number(q.tarefa.id) === Number(taskCopy.id))) : null;
                        if (found) {
                            taskCopy.quiz = found;
                            taskCopy.quizId = found.id;
                        }
                    } catch (err) {
                        console.warn('Fallback quiz fetch failed');
                    }
                }
                setCurrentTask(taskCopy);
            } catch (err) {
                const taskCopy = JSON.parse(JSON.stringify(taskToEdit));
                setCurrentTask(taskCopy);
            }
        } else {
            setIsEditing(false);
            // Preenche a missão automaticamente se houver filtro selecionado na tela
            setCurrentTask({
                ...INITIAL_TASK_STATE,
                missao_id: selectedMissionId ? Number(selectedMissionId) : null
            });
        }
        setShowModal(true);
        setError(null);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentTask(INITIAL_TASK_STATE);
    };

    const handleSaveTask = async () => {
        // 1. Validação de Título (Categoria removida)
        if (!currentTask.titulo) {
            alert("Preencha o Título da Tarefa.");
            return;
        }

        // 2. Validação de Missão
        if (!currentTask.missao_id) {
            alert('Selecione a Missão associada à Tarefa (campo obrigatório).');
            return;
        }
        
        // 3. Validação de Quiz (Apenas se for tipo Conhecimento/Quiz)
        const isQuizType = currentTask.tipo === 'conhecimento' || (currentTask.quiz !== null);
        
        if (isQuizType && currentTask.quiz) {
            const perguntas = currentTask.quiz.perguntas || currentTask.quiz.questions || [];
            if (perguntas.length === 0) {
                 if (currentTask.tipo === 'conhecimento') {
                    alert("Adicione pelo menos uma pergunta ao Quiz.");
                    return;
                 }
            } else {
                 const p1 = perguntas[0];
                 if (!p1.enunciado || !p1.resposta_correta) {
                    alert("Preencha o Enunciado e a Resposta Correta da pergunta.");
                    return;
                 }
            }
        }

        setIsSaving(true);
        try {
            let result;
            if (isEditing) {
                result = await updateTask(currentTask.id, currentTask);
                setTasks(prev => prev.map(t => t.id === result.id ? result : t));
            } else {
                result = await createTask(currentTask);
                setTasks(prev => [...prev, result]);
            }
            handleModalClose();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Falha ao salvar a Tarefa: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta Tarefa? Se for um Quiz, as perguntas também serão apagadas.")) return;

        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Falha ao excluir a Tarefa: ${errorMsg}`);
        }
    };
    
    // Helper para exibir nome da categoria (Mantido apenas para visualização, se existir)
    const getCategoryName = (task) => {
        if (task.categoria && task.categoria.nome) return task.categoria.nome;
        if (task.categoria_id) {
             const found = categories.find(c => c.id === task.categoria_id);
             if (found) return found.nome;
        }
        return null;
    };

    // --- FILTRAGEM ---
    const filteredTasks = selectedMissionId 
        ? tasks.filter(t => (t.missao_id || t.mission_id) === Number(selectedMissionId))
        : tasks;

    // --- RENDERIZAÇÃO ---

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader size={32} className="animate-spin text-[#006494] mb-4" /> 
                <p className="text-gray-500 font-medium text-sm">Sincronizando atividades...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR --- */}
            <div className="h-64 w-full bg-[#006494] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-5 text-white"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                            <ListChecks className="w-6 h-6 text-[#986dff]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Tarefas e Quizzes</h1>
                            <p className="text-blue-100/90 text-sm md:text-base mt-1 font-light">Gerencie atividades práticas e avaliações de conhecimento</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* ÁREA DE VINCULAÇÃO/FILTRO */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                <Map size={12} /> Filtrar por Missão
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedMissionId}
                                    onChange={(e) => setSelectedMissionId(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-[#006494] focus:border-[#006494] outline-none appearance-none transition-all cursor-pointer hover:bg-white"
                                >
                                    <option value="">Todas as Missões</option>
                                    {missionsList.map(m => (
                                        <option key={m.id} value={m.id}>{m.titulo}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Filter size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {selectedMissionId && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="md:mt-6"
                            >
                                <button
                                    onClick={() => setSelectedMissionId("")}
                                    className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Limpar
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Header de Ações */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 text-sm text-gray-600 font-medium shadow-sm">
                        {selectedMissionId 
                            ? <span>Tarefas nesta missão: <span className="text-[#006494] font-bold">{filteredTasks.length}</span></span>
                            : <span>Total de Atividades: <span className="text-[#006494] font-bold">{tasks.length}</span></span>
                        }
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleModalOpen()}
                        className="bg-[#986dff] text-white px-6 py-3 rounded-xl shadow-lg hover:brightness-90 hover:shadow-[#986dff]/20 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wide transform hover:-translate-y-0.5"
                        disabled={isSaving}
                    >
                        <Plus size={16} strokeWidth={3} />
                        {selectedMissionId ? "Criar Tarefa nesta Missão" : "Criar Nova Tarefa"}
                    </motion.button>
                </div>

                {/* Erro */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between gap-3 mb-6 shadow-sm text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                        <button onClick={loadData} className="p-1.5 hover:bg-red-100 rounded-md transition-colors">
                            <RefreshCw size={14} />
                        </button>
                    </motion.div>
                )}
                
                {/* Grid de Tarefas */}
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredTasks.length === 0 && !error ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="p-12 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center"
                            >
                                <Briefcase size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">
                                    {selectedMissionId ? "Nenhuma tarefa vinculada a esta missão." : "Nenhuma tarefa criada ainda."}
                                </p>
                                <p className="text-xs mt-1 opacity-70">Clique no botão acima para começar.</p>
                            </motion.div>
                        ) : (
                            filteredTasks.map((task, index) => {
                                // Determina o tipo para ícone e cor
                                const isQuiz = task.quiz || task.tipo === 'conhecimento';
                                const isDoc = task.tipo === 'administrativa';
                                const isSocial = task.tipo === 'social';

                                return (
                                    <motion.div 
                                        key={task.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden"
                                    >
                                        {/* Barra lateral colorida baseada no tipo */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isQuiz ? 'bg-indigo-500' : (isDoc ? 'bg-blue-500' : (isSocial ? 'bg-purple-500' : 'bg-amber-500'))}`} />
    
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isQuiz ? (
                                                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-indigo-100">
                                                            <CheckSquare size={10} /> Quiz
                                                        </span>
                                                    ) : isDoc ? (
                                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-blue-100">
                                                            <FileText size={10} /> Documento
                                                        </span>
                                                    ) : isSocial ? (
                                                        <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-purple-100">
                                                            <Camera size={10} /> Social
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-amber-100">
                                                            <Briefcase size={10} /> Tarefa
                                                        </span>
                                                    )}
                                                    
                                                    {getCategoryName(task) && (
                                                        <>
                                                            <span className="text-gray-300 text-xs">•</span>
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Tag size={12} /> {getCategoryName(task)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#006494] transition-colors">
                                                    {task.titulo}
                                                </h3>
                                                
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                                        <Trophy size={12} className="text-[#986dff]" /> 
                                                        {task.pontos} XP
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        Ordem: {task.ordem}
                                                    </span>
                                                    {/* Mostrar nome da missão se não estiver filtrado */}
                                                    {!selectedMissionId && (
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Map size={10} />
                                                            {missionsList.find(m => m.id === (task.missao_id || task.mission_id))?.titulo || 'Missão'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleModalOpen(task)} 
                                                    disabled={isSaving} 
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Editar Tarefa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTask(task.id)} 
                                                    disabled={isSaving} 
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Excluir Tarefa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de Tarefa/Quiz */}
            {showModal && (
                <TaskQuizModal 
                    task={currentTask}
                    setTask={setCurrentTask}
                    handleSave={handleSaveTask}
                    handleClose={handleModalClose}
                    isEditing={isEditing}
                    isLoading={isSaving}
                    categories={categories} 
                    missions={missionsList}
                />
            )}
        </div>
    );
};

export default TasksQuizzesContent;