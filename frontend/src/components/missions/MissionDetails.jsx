import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ArrowLeft, Calendar, Award, Trophy, User, CheckCircle, Lock, PlayCircle, Loader, MapPin, AlertCircle, LogOut, X, FileText, Camera,
    Repeat, Upload, Edit, MessageSquare, Zap, Trello, ListChecks, HelpCircle, Send, Bug
} from 'lucide-react';

// Importação externa mantida conforme solicitado.
// Este código não rodará no preview do navegador aqui devido à falta deste arquivo,
// mas funcionará no seu ambiente local.
import api from '../../api/api'; 

// ===================================================================
// COMPONENTES AUXILIARES
// ===================================================================

const getTaskIcon = (taskName = '', category = '', isCompleted) => {
    if (isCompleted) return CheckCircle;
    const nameLower = taskName.toLowerCase();
    if (nameLower.includes('quiz')) return ListChecks;
    if (nameLower.includes('flashcards')) return Repeat;
    if (nameLower.includes('envio') || nameLower.includes('documento')) return Upload;
    if (nameLower.includes('formulário') || nameLower.includes('feedback')) return Edit;
    if (nameLower.includes('linkedin') || nameLower.includes('comentar')) return MessageSquare;

    const catLower = (typeof category === 'string' ? category : category?.nome || '').toLowerCase();
    if (catLower.includes('conhecimento')) return Zap;
    if (catLower.includes('administrativa')) return FileText;
    if (catLower.includes('engajamento')) return MessageSquare;
    return Trello;
};

const TaskItem = ({ task, onClick, isLocked, isCompleted }) => {
    const taskName = task.titulo || 'Sem título';
    const category = task.categoria?.nome || 'Geral';
    const description = task.descricao || '';
    const points = Number(task.pontos || 0);
    const IconComponent = getTaskIcon(taskName, category, isCompleted);
    
    let statusLabel = 'PENDENTE';
    let statusClasses = 'text-orange-600 bg-orange-50 border-orange-200';
    let containerClasses = 'border-gray-200 hover:bg-gray-50 cursor-pointer';
    let textClasses = 'text-gray-800';
    let pointsClasses = 'text-orange-500';
    let iconBg = 'bg-gray-100 text-gray-700';

    if (isCompleted) {
        statusLabel = 'CONCLUÍDA';
        statusClasses = 'text-green-600 bg-green-50 border-green-200';
        containerClasses = 'border-green-400 bg-green-50/30';
        textClasses = 'text-gray-500 line-through';
        pointsClasses = 'text-gray-400';
        iconBg = 'bg-green-100 text-green-600';
    } else if (isLocked) {
        statusLabel = 'BLOQUEADA';
        statusClasses = 'text-gray-400 bg-gray-100 border-gray-200';
        containerClasses = 'border-gray-100 opacity-70 cursor-not-allowed bg-gray-50';
        textClasses = 'text-gray-400';
        pointsClasses = 'text-gray-400';
        iconBg = 'bg-gray-100 text-gray-400';
    }

    return (
        <div
            className={`flex justify-between items-start p-4 mb-3 border-l-4 rounded-lg transition-all duration-200 shadow-sm ${containerClasses}`}
            onClick={() => !isLocked && onClick && onClick(task)}
        >
            <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${iconBg}`}>
                    {isLocked ? <Lock className="w-6 h-6" /> : <IconComponent className="w-6 h-6" />}
                </div>
                <div className="min-w-0 overflow-hidden pt-0.5">
                    <h4 className={`font-semibold text-lg truncate ${textClasses}`}>
                        {taskName}
                    </h4>
                    <p className={`text-sm truncate mt-0.5 ${isCompleted || isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end whitespace-nowrap ml-4 flex-shrink-0">
                <span className={`font-bold text-lg ${pointsClasses}`}>
                    {points} pts
                </span>
                <span
                    className={`text-[10px] font-bold px-2 py-0.5 mt-1.5 rounded-full border tracking-wide ${statusClasses}`}
                >
                    {statusLabel}
                </span>
            </div>
        </div>
    );
};

// ===================================================================
// MODAL DE DETALHES DA TAREFA (Integrado para correção do Quiz)
// ===================================================================
const TaskDetailsModal = ({ task: initialTask, status, onClose, onComplete }) => {
    const [task, setTask] = useState(initialTask);
    const [file, setFile] = useState(null);
    const [socialLink, setSocialLink] = useState("");
    const [quizAnswers, setQuizAnswers] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDebug, setShowDebug] = useState(false); // Estado para controle manual do debug

    const isCompleted = status?.concluida;

    // 1. Busca dados frescos da tarefa ao abrir
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (!initialTask?.id || !initialTask?.missao_id) return;
            
            try {
                // Log para verificar a chamada
                console.log(`[DEBUG] Buscando detalhes da tarefa: /missions/${initialTask.missao_id}/tasks/${initialTask.id}`);
                const res = await api.get(`/missions/${initialTask.missao_id}/tasks/${initialTask.id}`);
                
                if (isMounted && res.data) {
                    console.log("[DEBUG] Dados recebidos da API:", res.data);
                    setTask(prev => ({ ...prev, ...res.data }));
                }
            } catch (e) {
                console.error("Erro ao atualizar tarefa", e);
                setError("Falha ao carregar detalhes completos da tarefa.");
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [initialTask]);

    // 2. Extração Robusta das Perguntas
    const questions = useMemo(() => {
        if (!task) return [];
        let found = [];

        console.groupCollapsed("[DEBUG] Tentando extrair perguntas...");

        // ESTRATÉGIA A: Relacionamento direto 'quiz'
        if (task.quiz) {
            console.log("Objeto 'quiz' encontrado:", task.quiz);
            if (Array.isArray(task.quiz.perguntas) && task.quiz.perguntas.length > 0) {
                found = task.quiz.perguntas;
                console.log(">> Perguntas encontradas em task.quiz.perguntas");
            } else if (Array.isArray(task.quiz.questions) && task.quiz.questions.length > 0) {
                found = task.quiz.questions;
                console.log(">> Perguntas encontradas em task.quiz.questions");
            }
        }

        // ESTRATÉGIA B: Campo 'requisitos'
        if (found.length === 0 && task.requisitos) {
            console.log("Campo 'requisitos' encontrado (bruto):", task.requisitos);
            let req = task.requisitos;
            
            // Tratamento agressivo de JSON stringificado
            if (typeof req === 'string') {
                try { 
                    req = JSON.parse(req);
                    // Tenta parsear de novo caso seja string dentro de string (double encoded)
                    if (typeof req === 'string') req = JSON.parse(req);
                    console.log("Requisitos após parse:", req);
                } catch (e) { 
                    console.warn("Falha ao parsear requisitos:", e);
                    req = null; 
                }
            }

            if (req) {
                const list = req.perguntas || req.questions || req.itens || (Array.isArray(req) ? req : []);
                if (Array.isArray(list) && list.length > 0) {
                    found = list;
                    console.log(">> Perguntas encontradas em requisitos (parseado)");
                }
            }
        }

        console.groupEnd();

        // 3. Normalização Final
        return found.map((q, i) => ({
            id: q.id ?? `q-${i}`,
            enunciado: q.enunciado || q.pergunta || q.question || q.texto || "Pergunta sem texto",
            opcoes: q.opcoes || q.alternativas || q.options || q.respostas || [],
            tipo: q.tipo || 'multipla_escolha'
        }));
    }, [task]);

    // --- SUBMISSÕES ---

    const handleQuizOptionSelect = (questionId, option) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = async (type, evidenceData) => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `/missions/${task.missao_id}/tasks/${task.id}/submit`;
            await api.post(endpoint, { evidencias: { type, ...evidenceData } });
            onComplete();
        } catch (err) {
            setError(err.message || "Erro ao enviar.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            if (f.size > 25 * 1024 * 1024) return setError("Arquivo muito grande (Max 25MB)");
            setFile(f);
            setError(null);
        }
    };

    // Renderização do Conteúdo do Modal
    const renderContent = () => {
        const type = (task.tipo || '').toLowerCase();
        const cat = (typeof task.categoria === 'string' ? task.categoria : task.categoria?.nome || '').toLowerCase();

        // --- RENDER: QUIZ ---
        if (questions.length > 0) {
            return (
                <div className="space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900">
                        <h4 className="font-bold flex items-center gap-2 text-sm"><HelpCircle size={16}/> Quiz</h4>
                        <p className="text-xs mt-1">Responda corretamente para pontuar.</p>
                    </div>
                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="space-y-2">
                                <p className="font-bold text-sm text-gray-800">{idx + 1}. {q.enunciado}</p>
                                {q.opcoes.map((opt, optIdx) => (
                                    <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === opt ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input 
                                            type="radio" 
                                            name={`q-${q.id}`} 
                                            className="hidden"
                                            checked={quizAnswers[q.id] === opt}
                                            onChange={() => setQuizAnswers(p => ({ ...p, [q.id]: opt }))}
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${quizAnswers[q.id] === opt ? 'border-indigo-600' : 'border-gray-400'}`}>
                                            {quizAnswers[q.id] === opt && <div className="w-2 h-2 bg-indigo-600 rounded-full"/>}
                                        </div>
                                        <span className="text-sm text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => {
                            const allAnswered = questions.every(q => quizAnswers[q.id]);
                            if (!allAnswered) return setError("Responda todas as perguntas.");
                            handleSubmit('quiz', { answers: quizAnswers });
                        }} 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5"/> : <ListChecks size={18}/>} Enviar Respostas
                    </button>
                </div>
            );
        }

        // Se for tipo quiz mas não achou perguntas
        if (type === 'conhecimento' || cat.includes('quiz')) {
             return (
                <div className="text-center py-8">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-bold">Perguntas não encontradas.</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                        O sistema não conseguiu identificar a lista de perguntas no objeto da tarefa.
                    </p>
                    
                    {/* BLOCO DE DIAGNÓSTICO: Mostra os dados crus para entender o erro */}
                    <div className="mt-6 border border-red-200 bg-red-50 rounded-lg p-4 text-left">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-xs mb-2 uppercase tracking-wide">
                            <Bug size={14} /> Modo Diagnóstico
                        </div>
                        <p className="text-xs text-red-600 mb-2">
                            Abaixo está o JSON bruto que a API retornou. Procure onde estão as perguntas (ex: <code>questions</code>, <code>itens</code>, <code>perguntas</code>) e ajuste o código.
                        </p>
                        <pre className="text-[10px] leading-tight bg-white p-3 rounded border border-red-100 overflow-auto max-h-60 font-mono text-gray-600">
                            {JSON.stringify(task, null, 2)}
                        </pre>
                    </div>
                </div>
            );
        }

        // --- RENDER: DOCUMENTO ---
        if (type === 'administrativa' || cat.includes('document')) {
            return (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900">
                        <h4 className="font-bold flex items-center gap-2 text-sm"><FileText size={16}/> Envio de Arquivo</h4>
                        <p className="text-xs mt-1">{task.descricao}</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white cursor-pointer relative">
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {file ? (
                            <div className="text-center">
                                <FileText className="w-8 h-8 text-orange-500 mx-auto mb-2"/>
                                <p className="font-bold text-sm text-gray-700">{file.name}</p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <Upload size={32} className="mx-auto mb-2"/>
                                <p className="text-sm">Clique para anexar PDF/IMG</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => handleSubmit('document', { fileName: file.name })}
                        disabled={!file || loading}
                        className="w-full bg-[#FE5900] text-white py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 flex justify-center gap-2"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5"/> : <Send size={18}/>} Enviar
                    </button>
                </div>
            );
        }

        // --- RENDER: SOCIAL ---
        if (type === 'social' || cat.includes('social')) {
            return (
                <div className="space-y-6">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-900">
                        <h4 className="font-bold flex items-center gap-2 text-sm"><Camera size={16}/> Desafio Social</h4>
                        <p className="text-xs mt-1">{task.descricao}</p>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Link da Postagem</label>
                         <input 
                            type="url" 
                            placeholder="https://instagram.com/p/..." 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            value={socialLink}
                            onChange={(e) => setSocialLink(e.target.value)}
                         />
                    </div>
                    <button 
                        onClick={() => handleSubmit('social', { link: socialLink })}
                        disabled={!socialLink || loading}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex justify-center gap-2"
                    >
                        {loading ? <Loader className="animate-spin w-5 h-5"/> : <CheckCircle size={18}/>} Validar Link
                    </button>
                </div>
            );
        }

        // --- RENDER: GENÉRICO ---
        return (
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600">{task.descricao || "Realize a atividade."}</p>
                </div>
                
                {/* Botão para ativar debug manual em qualquer tarefa */}
                <div className="flex justify-center">
                    <button 
                        onClick={() => setShowDebug(!showDebug)} 
                        className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    >
                        <Bug size={10} /> {showDebug ? "Ocultar Dados" : "Ver Dados Crus"}
                    </button>
                </div>

                {showDebug && (
                    <pre className="mt-2 text-[10px] leading-tight bg-gray-100 p-2 rounded border border-gray-200 overflow-auto max-h-40 font-mono text-gray-600">
                        {JSON.stringify(task, null, 2)}
                    </pre>
                )}

                <button 
                    onClick={() => handleSubmit('generic', { status: 'done' })}
                    disabled={loading}
                    className="w-full bg-[#394C97] text-white py-3 rounded-xl font-bold hover:bg-blue-900 flex justify-center gap-2 mt-2"
                >
                    {loading ? <Loader className="animate-spin w-5 h-5"/> : <CheckCircle size={18}/>} Concluir
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 truncate pr-4">{task.titulo}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex gap-2"><AlertCircle size={14}/> {error}</div>}
                    
                    {isCompleted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32}/></div>
                            <h3 className="text-xl font-bold text-gray-800">Tarefa Concluída!</h3>
                            <p className="text-gray-500 text-sm mt-1">Pontos creditados.</p>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// PÁGINA PRINCIPAL
// ===================================================================

export default function MissionDetails({ mission: initialMissionData, onBack, readOnly = false }) {
    const [fullMissionData, setFullMissionData] = useState(initialMissionData);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTab, setActiveTab] = useState('Todas');
    const [error, setError] = useState(null);

    const fetchDetails = useCallback(async () => {
        if (!initialMissionData?.id) return;
        setLoading(prev => !fullMissionData ? true : prev);
        try {
            const endpoint = readOnly ? `/missions/${initialMissionData.id}` : `/missions/${initialMissionData.id}/full`;
            const res = await api.get(endpoint);
            setFullMissionData(res.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar detalhes:", err);
            if (!fullMissionData) {
                setError("Não foi possível carregar os detalhes da missão.");
            }
        } finally {
            setLoading(false);
        }
    }, [initialMissionData, fullMissionData, readOnly]);

    useEffect(() => {
        fetchDetails();
    }, []);

    const handleJoin = async () => {
        if (readOnly) return; 
        if (!window.confirm("Deseja iniciar esta missão?")) return;
        
        setJoining(true);
        try {
            await api.post(`/missions/${initialMissionData.id}/join`);
            setFullMissionData(prev => ({
                ...(prev || initialMissionData),
                isJoined: true,
                status: 'Inscrito',
                userProgress: prev?.userProgress || { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} },
                ranking: prev?.ranking ? [...prev.ranking] : [] 
            }));
            fetchDetails(); 
        } catch (err) {
            alert(err.message || "Erro ao se inscrever.");
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (readOnly) return;
        if (!window.confirm("Tem certeza que deseja sair desta missão? Seu progresso será perdido.")) return;
        setLeaving(true);
        try {
            await api.delete(`/missions/${initialMissionData.id}/join`);
            setFullMissionData(prev => ({
                ...prev,
                isJoined: false,
                status: 'Disponível',
                userProgress: { totalPoints: 0, completedTasksCount: 0, tasksStatus: {} }
            }));
            fetchDetails();
        } catch (err) {
            alert(err.message || "Erro ao sair da missão.");
        } finally {
            setLeaving(false);
        }
    };

    const handleTaskClick = (task) => {
        if (readOnly) return;
        const currentData = fullMissionData || initialMissionData;
        
        const statusLower = String(currentData.status || '').toLowerCase();
        const participationStatus = String(currentData.status_participacao || '').toLowerCase();
        
        const isUserJoined = 
            currentData.isJoined === true || 
            currentData.isJoined === 1 || 
            ['inscrito', 'participando', 'matriculado', 'joined', 'confirmado'].includes(statusLower) ||
            ['inscrito', 'participando', 'confirmado'].includes(participationStatus);

        if (!isUserJoined) return;
        setSelectedTask(task);
    };

    if (loading && !fullMissionData && !initialMissionData) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto text-[#394C97] mb-2" /> Carregando missão...</div>;
    
    if (error && !fullMissionData) return <div className="p-10 text-center text-red-500"><AlertCircle className="mx-auto mb-2"/>{error}<br/><button onClick={onBack} className="mt-4 underline">Voltar</button></div>;

    const mission = fullMissionData || initialMissionData;
    const { title, descricao, deadline, destino, tarefas = [], userProgress, ranking, foto_url } = mission;

    // Cálculo e Status na Página Principal
    const statusLower = String(mission.status || '').toLowerCase();
    const participationStatus = String(mission.status_participacao || mission.statusParticipacao || '').toLowerCase();
    const isUserJoined = 
        mission.isJoined === true || 
        mission.isJoined === 1 || 
        ['inscrito', 'participando', 'matriculado', 'joined', 'confirmado'].includes(statusLower) ||
        ['inscrito', 'participando', 'confirmado'].includes(participationStatus);

    const totalPoints = useMemo(() => {
        // Prefere total calculado pelo backend quando disponível
        if (mission && mission.totalPoints != null) return Number(mission.totalPoints || 0);

        const items = [...(tarefas || []), ...(mission.quiz?.questions || [])];
        if (items.length === 0) return Number(mission.pontos || mission.points || 0);
        return items.reduce((acc, item) => acc + (Number(item.pontos || item.points || 0) || 0), 0);
    }, [mission, tarefas]);

    const tasksStatus = userProgress?.tasksStatus || {};
    const myTotalPoints = userProgress?.totalPoints || 0;
    const completedCount = userProgress?.completedTasksCount || 0;
    const totalTasks = tarefas.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const categories = ['Todas', ...new Set(tarefas.map(t => typeof t.categoria === 'string' ? t.categoria : t.categoria?.nome || 'Geral'))];
    const filteredTasks = activeTab === 'Todas' ? tarefas : tarefas.filter(t => (typeof t.categoria === 'string' ? t.categoria : t.categoria?.nome || 'Geral') === activeTab);

    return (
        <div className={`bg-gray-50 ${readOnly ? '' : 'p-4 sm:p-6 md:p-8 min-h-screen pb-24'}`}>
            <div className={readOnly ? "" : "max-w-5xl mx-auto"}>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Capa */}
                    <div className="h-48 w-full bg-gray-200 relative">
                        {foto_url ? (
                            <img src={foto_url} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-800 text-white/20">
                                <MapPin size={64} />
                            </div>
                        )}
                        {!readOnly && onBack && (
                            <button 
                                onClick={onBack}
                                className="absolute top-4 left-4 bg-white/90 backdrop-blur hover:bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Voltar
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><MapPin size={14} /> {destino || 'Global'}</span>
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><Calendar size={14} /> {deadline || 'Sem prazo'}</span>
                                    <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold border border-orange-100">
                                        <Award size={14} /> {totalPoints} XP Totais
                                    </span>
                                </div>
                                <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
                                    {descricao || "Confira as tarefas desta missão."}
                                </p>
                            </div>

                            {/* Botões de Ação */}
                            {!readOnly && (
                                <div className="flex flex-col items-end gap-2 min-w-[200px]">
                                    {!isUserJoined ? (
                                        <button 
                                            onClick={handleJoin} 
                                            disabled={joining}
                                            className="w-full bg-[#FE5900] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {joining ? <Loader className="animate-spin w-5 h-5"/> : <PlayCircle className="w-5 h-5 fill-current" />}
                                            Iniciar Missão
                                        </button>
                                    ) : (
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="w-full bg-green-50 text-green-700 px-6 py-3 rounded-xl font-bold border border-green-200 flex items-center justify-center gap-2 uppercase tracking-wide text-xs">
                                                <CheckCircle className="w-5 h-5" /> INSCRITO
                                            </div>
                                            <button 
                                                onClick={handleLeave}
                                                disabled={leaving}
                                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                            >
                                                {leaving ? <Loader className="animate-spin w-3 h-3"/> : <LogOut className="w-3 h-3" />}
                                                Sair da Missão
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Barra de Progresso */}
                        {!readOnly && isUserJoined && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between gap-4 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Trophy size={20} /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Seus Pontos</p>
                                        <p className="text-xl font-black text-gray-800">{myTotalPoints}</p>
                                    </div>
                                </div>
                                <div className="flex-1 max-w-sm">
                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                                        <span>Progresso</span>
                                        <span>{Math.round(progressPercentage)}% ({completedCount}/{totalTasks})</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-[#394C97] transition-all duration-1000 ease-out" 
                                            style={{ width: `${progressPercentage}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de Tarefas e Ranking */}
                <div className={`grid grid-cols-1 ${readOnly ? '' : 'lg:grid-cols-3'} gap-8`}>
                    <div className={readOnly ? 'w-full' : 'lg:col-span-2 space-y-6'}>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                        activeTab === cat 
                                        ? 'bg-[#394C97] text-white shadow-md' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 mt-4">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => {
                                    const status = tasksStatus[task.id];
                                    return (
                                        <TaskItem 
                                            key={task.id}
                                            task={task}
                                            isLocked={!isUserJoined && !readOnly}
                                            isCompleted={status?.concluida}
                                            onClick={handleTaskClick}
                                        />
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                                    <p>Nenhuma tarefa encontrada.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!readOnly && (
                        <div className="lg:col-span-1">
                           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                               <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Trophy className="w-5 h-5 text-yellow-500 mr-2"/> Ranking</h3>
                               {ranking && ranking.length > 0 ? (
                                   <div className="space-y-3">
                                           {ranking.map((user, idx) => (
                                           <div key={idx} className="flex items-center justify-between text-sm">
                                               <div className="flex items-center gap-2">
                                                   <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</span>
                                                   <span className={`truncate max-w-[120px] ${user.isCurrentUser ? 'font-bold text-[#394C97]' : 'text-gray-600'}`}>{user.name}</span>
                                               </div>
                                               <span className="font-bold text-gray-700">{user.points} pts</span>
                                           </div>
                                           ))}
                                   </div>
                               ) : (
                                   <p className="text-sm text-gray-500 text-center py-4">Inicie para ver o ranking.</p>
                               )}
                           </div>
                        </div>
                    )}
                </div>

                {/* Modal de Detalhes da Tarefa (Integrado) */}
                {selectedTask && isUserJoined && !readOnly && (
                    <TaskDetailsModal
                        task={selectedTask}
                        status={tasksStatus[selectedTask.id]}
                        onClose={() => setSelectedTask(null)}
                        onComplete={() => {
                            fetchDetails();
                            setSelectedTask(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}