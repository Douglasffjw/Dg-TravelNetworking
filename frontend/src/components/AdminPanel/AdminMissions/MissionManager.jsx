import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    AlertTriangle, 
    Loader, 
    Map, 
    RefreshCw,
    Search
} from "lucide-react";

// API
import { 
    fetchMissions, 
    createMission, 
    updateMission, 
    deleteMissionApi, 
    createTask, 
    updateTask, 
    deleteTask 
} from '../../../api/apiFunctions'; 

// Componentes Locais
import MissionModal from './MissionModal';
import MissionCard from './MissionCard';
import MissionParticipantsModal from './MissionParticipantsModal';

const INITIAL_QUIZ_STATE = {
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
};

const INITIAL_MISSION_STATE = {
    titulo: "",
    descricao: "",
    destino: "",
    data_inicio: "",
    data_fim: "",
    preco: 0.00,
    vagas_disponiveis: 0,
    ativa: true,
    missao_anterior_id: null,
    foto_url: "",
    title: "",
    city: "",
    points: 0,
    expirationDate: "",
    imageUrl: "",
    steps: [{ description: "", points: 0 }],
    quiz: null,
};

const createEmptyMission = () => ({
    ...INITIAL_MISSION_STATE,
    steps: [{ description: "", points: 0 }],
    quiz: null,
});

function normalizeQuizToUI(quiz) {
    if (!quiz) return null;
    if (quiz.question || quiz.options) {
        const opts = Array.isArray(quiz.options) ? quiz.options : INITIAL_QUIZ_STATE.options;
        const idx = typeof quiz.correctIndex === 'number' ? quiz.correctIndex : 0;
        return { question: quiz.question || '', options: opts, correctIndex: idx };
    }
    const firstQuestion = Array.isArray(quiz.perguntas) ? quiz.perguntas[0] : null;
    const opts = Array.isArray(firstQuestion?.opcoes) ? firstQuestion.opcoes : INITIAL_QUIZ_STATE.options;
    const idx = firstQuestion?.resposta_correta ? opts.findIndex(opt => opt === firstQuestion.resposta_correta) : -1;
    return {
        question: firstQuestion?.enunciado || firstQuestion?.titulo || '',
        options: opts,
        correctIndex: idx >= 0 ? idx : 0,
    };
}

function normalizeMission(m) {
    if (!m) return { ...INITIAL_MISSION_STATE, _raw: m };

    let steps = [];
    if (Array.isArray(m.steps) && m.steps.length > 0) {
        steps = m.steps.map(s => ({ id: s.id, description: s.description || s.descricao || '', points: s.points || s.pontos || 0 }));
    } else if (Array.isArray(m.tarefas) && m.tarefas.length > 0) {
        steps = m.tarefas.map(t => ({ id: t.id, description: t.descricao || t.titulo || '', points: t.pontos || t.points || 0 }));
    }

    const totalPoints = steps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
    const imgUrl = m.foto_url || m.imageUrl || "";

    return {
        id: m.id,
        title: m.titulo || m.title || '',
        city: m.destino || m.city || '',
        descricao: m.descricao || '',
        points: totalPoints || Number(m.points || m.pontos || 0),
        totalPoints: Number(m.totalPoints ?? totalPoints ?? m.pontos ?? m.points ?? 0),
        preco: m.preco != null ? Number(m.preco) : null,
        vagas_disponiveis: m.vagas_disponiveis != null ? Number(m.vagas_disponiveis) : null,
        expirationDate: m.data_fim ? String(m.data_fim).slice(0,10) : (m.expirationDate || ''),
        steps: steps.length ? steps : (m.steps || []),
        quiz: normalizeQuizToUI(m.quiz),
        ativa: (m.ativa === undefined || m.ativa === null) ? true : Boolean(m.ativa),
        imageUrl: imgUrl,
        foto_url: imgUrl,
        _raw: m,
    };
}

async function syncTasksForMission(missionId, steps) {
    if (!Array.isArray(steps)) return [];
    const results = [];
    for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        try {
            const payload = {
                missao_id: missionId,
                titulo: s.titulo || s.title || (s.description ? (String(s.description).length > 30 ? String(s.description).slice(0,30) + '...' : String(s.description)) : `Etapa ${i+1}`),
                descricao: s.description ?? s.descricao ?? null,
                pontos: s.points != null ? s.points : s.pontos || 0,
                ordem: i,
            };

            if (s.id) {
                const res = await updateTask(s.id, payload);
                results.push(res?.task || res);
            } else {
                const res = await createTask(payload);
                results.push(res?.task || res);
            }
        } catch (err) {
            console.error('Falha ao sincronizar etapa:', s, err);
        }
    }
    return results.map(t => ({ id: t.id, description: t.titulo || t.descricao || '', points: t.pontos }));
}

const MissionManager = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modais
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newMission, setNewMission] = useState(createEmptyMission);
    
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [currentManageMission, setCurrentManageMission] = useState(null);

    // READ
    const loadMissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMissions();
            const normalized = (data || []).map(normalizeMission).filter(m => m.ativa !== false);
            setMissions(normalized);
        } catch (err) {
            setError(`Falha ao carregar missões: ${err.message || 'Erro de conexão'}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMissions();
    }, [loadMissions]);

    // HANDLERS
    const handleModalOpen = (missionToEdit = null) => {
        if (missionToEdit) {
            setIsEditing(true);
            setEditingId(missionToEdit.id);
            const m = JSON.parse(JSON.stringify(missionToEdit));
            setNewMission({
                ...createEmptyMission(),
                ...m,
                title: m.titulo || m.title || "",
                city: m.destino || m.city || "",
                descricao: m.descricao || "",
                points: m.points || 0,
                expirationDate: m.data_fim ? String(m.data_fim).slice(0,10) : (m.expirationDate || ""),
                imageUrl: m.foto_url || m.imageUrl || "", 
                quiz: normalizeQuizToUI(m.quiz),
            });
        } else {
            setIsEditing(false);
            setEditingId(null);
            setNewMission(createEmptyMission());
        }
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setNewMission(createEmptyMission());
    };

    const handleOpenParticipants = (mission) => {
        setCurrentManageMission(mission);
        setShowParticipantsModal(true);
    };

    const handleAddStep = () => {
        setNewMission((prev) => ({ ...prev, steps: [...(prev.steps || []), { description: '', points: 0 }] }));
    };

    const handleRemoveStep = (index) => {
        setNewMission((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
    };

    const handleToggleQuiz = () => {
        setNewMission((prev) => ({
            ...prev,
            quiz: prev.quiz ? null : { ...INITIAL_QUIZ_STATE },
        }));
    };

    const handleSaveMission = async () => {
        if (!(newMission.titulo || newMission.title) || !(newMission.destino || newMission.city)) {
            alert("Preencha Título e Destino.");
            return;
        }
        
        const todayIso = new Date().toISOString().slice(0,10);
        const startDate = newMission.data_inicio || newMission.startDate || todayIso;
        const endDate = newMission.data_fim || newMission.expirationDate || null;
        
        if (!endDate) {
            alert('Preencha a data de término.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                titulo: newMission.titulo || newMission.title,
                descricao: newMission.descricao || "",
                destino: newMission.destino || newMission.city,
                data_inicio: startDate,
                data_fim: endDate,
                preco: newMission.preco != null ? newMission.preco : newMission.points || 0,
                vagas_disponiveis: newMission.vagas_disponiveis != null ? newMission.vagas_disponiveis : 0,
                ativa: true,
                missao_anterior_id: null,
                foto_url: newMission.imageUrl || newMission.foto_url || "", 
            };

            if (isEditing) {
                const updated = await updateMission(editingId, payload);
                const norm = normalizeMission(updated);
                
                const originalMission = missions.find(m => m.id === editingId);
                const originalStepIds = (originalMission?.steps || []).filter(s => s.id).map(s => s.id);
                const currentStepIds = (newMission.steps || []).filter(s => s.id).map(s => s.id);
                const toDeleteIds = originalStepIds.filter(id => !currentStepIds.includes(id));

                const synced = await syncTasksForMission(norm.id || editingId, newMission.steps || []);

                if (toDeleteIds.length > 0) {
                    await Promise.all(toDeleteIds.map(id => deleteTask(id).catch(e => console.error(e))));
                }

                const totalPointsUpdated = (synced || []).reduce((s, it) => s + (Number(it.points) || 0), 0);
                const final = { ...norm, steps: synced, points: totalPointsUpdated };
                setMissions(missions.map(m => m.id === editingId ? final : m));
            } else {
                const created = await createMission(payload);
                const norm = normalizeMission(created);
                const synced = await syncTasksForMission(created.id, newMission.steps || []);
                const totalPointsCreated = (synced || []).reduce((s, it) => s + (Number(it.points) || 0), 0);
                const final = { ...norm, steps: synced, points: totalPointsCreated };
                setMissions([...missions, final]);
            }
            handleModalClose();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            alert(`Erro ao salvar: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMission = async (id) => {
        if (!window.confirm("Excluir esta missão?")) return;
        try {
            await deleteMissionApi(id);
            setMissions(missions.filter(m => m.id !== id));
        } catch (err) {
            alert(`Erro ao excluir: ${err.message}`);
        }
    };

    const filteredMissions = missions.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // RENDERIZAÇÃO
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader size={32} className="animate-spin text-[#006494] mb-4" /> 
                <p className="text-gray-500 font-medium text-sm">Carregando missões...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* CONTEÚDO PRINCIPAL */}
            <div className="max-w-7xl mx-auto relative z-20">
                
                {/* Header de Ações */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-80 bg-white p-1.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 px-3">
                        <Search className="text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar missão..."
                            className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-xs py-1.5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleModalOpen()}
                        className="w-full md:w-auto bg-[#986dff] text-white px-6 py-3 rounded-xl shadow-lg hover:brightness-90 hover:shadow-[#986dff]/20 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wide transform hover:-translate-y-0.5"
                        disabled={isSaving}
                    >
                        <Plus size={16} strokeWidth={3} />
                        Criar Nova Missão
                    </motion.button>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between gap-3 mb-6 shadow-sm text-sm">
                        <div className="flex items-center gap-2"><AlertTriangle size={16} /><span>{error}</span></div>
                        <button onClick={loadMissions} className="p-1.5 hover:bg-red-100 rounded-md transition-colors"><RefreshCw size={14} /></button>
                    </motion.div>
                )}
                
                {/* Grid de Missões */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredMissions.length === 0 && !error ? (
                            <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                                <Map size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">Nenhuma missão encontrada.</p>
                            </div>
                        ) : (
                            filteredMissions.map((mission, index) => (
                                <motion.div key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <MissionCard 
                                        mission={mission} 
                                        onEdit={() => handleModalOpen(mission)} 
                                        onDelete={() => handleDeleteMission(mission.id)} 
                                        onManageParticipants={() => handleOpenParticipants(mission)}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de CRUD Missão */}
            {showModal && (
                <MissionModal 
                    newMission={newMission} 
                    setNewMission={setNewMission} 
                    handleAddStep={handleAddStep} 
                    handleRemoveStep={handleRemoveStep} 
                    handleToggleQuiz={handleToggleQuiz} 
                    handleSaveMission={handleSaveMission} 
                    handleModalClose={handleModalClose} 
                    isEditing={isEditing} 
                    isLoading={isSaving} 
                />
            )}

            {/* Modal de Participantes */}
            {showParticipantsModal && currentManageMission && (
                <MissionParticipantsModal
                    mission={currentManageMission}
                    onClose={() => {
                        setShowParticipantsModal(false);
                        setCurrentManageMission(null);
                    }}
                />
            )}
        </div>
    );
};

export default MissionManager;