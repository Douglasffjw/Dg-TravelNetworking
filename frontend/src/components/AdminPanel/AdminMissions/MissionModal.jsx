import React, { useState, useEffect, useMemo } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { X, Settings, Image as ImageIcon, Briefcase, Loader, DollarSign, Users, Calendar, MapPin, UploadCloud, GripVertical, Trophy, CheckCircle, FileText, Camera, AlertCircle, Trash2, Calculator } from "lucide-react";

// Use API functions reais
import { fetchTasks, updateTask, deleteTask } from '../../../api/apiFunctions';

// Supabase upload shim (keeps existing behavior in this file)
const supabase = {
    storage: {
        from: () => ({
            upload: async () => {
                await new Promise(r => setTimeout(r, 1000));
                return { error: null };
            },
            getPublicUrl: () => ({
                data: { publicUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60" }
            })
        })
    }
};

// ===================================================================
// COMPONENTE MISSION MODAL
// ===================================================================

const MissionModal = ({ newMission, setNewMission, handleSaveMission, handleModalClose, isEditing, isLoading }) => {
    
    const [uploading, setUploading] = useState(false);
    const [linkedTasks, setLinkedTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // LÓGICA DE OURO: Cálculo dinâmico dos pontos
    // - Se houver `linkedTasks` (missão existente com tarefas no DB), soma elas
    // - Caso contrário (missão nova), soma `newMission.steps` que o user editou no modal
    const totalMissionPoints = useMemo(() => {
        const fromLinked = Array.isArray(linkedTasks) && linkedTasks.length > 0
            ? linkedTasks.reduce((acc, task) => acc + (Number(task.pontos || task.points || 0) || 0), 0)
            : 0;

        if (fromLinked > 0) return fromLinked;

        const fromSteps = Array.isArray(newMission?.steps)
            ? newMission.steps.reduce((acc, s) => acc + (Number(s.points || s.pontos || 0) || 0), 0)
            : 0;

        return fromSteps;
    }, [linkedTasks, newMission]);

    // Carrega as tarefas vinculadas a esta missão ao abrir o modal
    useEffect(() => {
        if (newMission?.id) {
            loadMissionTasks();
        } else {
            setLinkedTasks([]);
        }
    }, [newMission?.id]);

    const loadMissionTasks = async () => {
        setLoadingTasks(true);
        try {
            const allTasks = await fetchTasks();
            const targetMissionId = Number(newMission.id);

            const missionTasks = Array.isArray(allTasks) 
                ? allTasks.filter(t => {
                    const taskMissionId = t.missao_id || t.mission_id || t.missionId;
                    const isActive = t.ativa !== false;
                    return taskMissionId && Number(taskMissionId) === targetMissionId && isActive;
                })
                : [];

            missionTasks.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
            setLinkedTasks(missionTasks);
        } catch (error) {
            console.error("Erro ao buscar tarefas via API:", error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleDeleteLinkedTask = async (taskId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta tarefa permanentemente?")) {
            return;
        }
        try {
            await deleteTask(taskId);
            setLinkedTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
            alert("Erro ao excluir tarefa. Tente novamente.");
        }
    };

    const handleImageUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert("A imagem de capa deve ter no máximo 2MB.");
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `mission_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `capas/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setNewMission({ ...newMission, imageUrl: data.publicUrl });

        } catch (error) {
            console.error("Erro de upload:", error);
            alert(`Erro no upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const onSaveWrapper = async () => {
        if (linkedTasks.length > 0) {
            try {
                const updatePromises = linkedTasks.map((task, index) => {
                    if (task.ordem !== index) {
                        return updateTask(task.id, { ...task, ordem: index });
                    }
                    return Promise.resolve();
                });
                await Promise.all(updatePromises);
            } catch (err) {
                console.error("Erro ao sincronizar ordem das tarefas:", err);
            }
        }
        
        console.group("🚀 [LOGICA] Salvando Missão");
        console.log("Pontos Calculados (Dinâmico):", totalMissionPoints);
        console.log("Nota: O campo 'pontos' não será salvo na tabela 'missoes', pois é derivado.");
        console.groupEnd();

        // Removemos o envio manual de pontos, pois agora é calculado no front ou no back
        handleSaveMission();
    };

    return (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar w-full h-full text-gray-800">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={handleModalClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col mt-10 mb-10 z-50"
            >
                <button
                    onClick={handleModalClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shadow-sm border border-gray-100"
                >
                    <X size={24} />
                </button>

                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-[#006494]">
                        {isEditing ? "Editar Missão" : "Nova Missão"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Configure os detalhes e organize a jornada do usuário.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* SEÇÃO 1: DADOS E CAPA */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-5">
                            <div className="flex items-center gap-2 text-[#006494] font-bold text-xs uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                                <Settings size={14} /> Dados Gerais
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Título</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Imersão no Vale do Silício"
                                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-[#006494]/20 outline-none font-bold text-gray-700"
                                    value={newMission.titulo || newMission.title || ""}
                                    onChange={(e) => setNewMission({ ...newMission, titulo: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Descrição</label>
                                <textarea
                                    placeholder="Detalhes..."
                                    rows={2}
                                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-[#006494]/20 outline-none text-sm resize-none"
                                    value={newMission.descricao || ""}
                                    onChange={(e) => setNewMission({ ...newMission, descricao: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Cidade</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm"
                                                value={newMission.destino || newMission.cidade || newMission.city || ""}
                                                onChange={(e) => setNewMission({ ...newMission, destino: e.target.value })}
                                            />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Expiração</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm text-gray-600"
                                            value={newMission.expirationDate ? newMission.expirationDate.split('T')[0] : ""}
                                            onChange={(e) => setNewMission({ ...newMission, expirationDate: e.target.value })}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                
                                {/* CAMPO DE PONTOS (ALTERADO)
                                   Agora é READ-ONLY e calculado dinamicamente.
                                */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 flex items-center gap-1">
                                        Total XP <Calculator size={10} className="text-gray-400"/>
                                    </label>
                                    <div className="relative group">
                                        <Trophy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"/>
                                        <input
                                            type="number"
                                            readOnly
                                            disabled
                                            className="w-full border border-gray-200 bg-gray-100 p-3 pl-10 rounded-xl outline-none text-sm font-bold text-gray-500 cursor-not-allowed"
                                            value={totalMissionPoints}
                                            title="Soma automática das tarefas vinculadas"
                                        />
                                        {/* Tooltip simples */}
                                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap z-10">
                                            Soma dos pontos das tarefas
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Valor (R$)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm"
                                            value={newMission.preco ?? ''}
                                            onChange={(e) => setNewMission({ ...newMission, preco: e.target.value === '' ? null : Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Vagas</label>
                                    <div className="relative">
                                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none text-sm"
                                            value={newMission.vagas_disponiveis ?? ''}
                                            onChange={(e) => setNewMission({ ...newMission, vagas_disponiveis: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-2">Capa da Missão</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors h-full min-h-[200px] relative overflow-hidden group">
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader className="animate-spin text-[#006494] mb-2" />
                                        <span className="text-xs text-gray-400">Enviando...</span>
                                    </div>
                                ) : newMission.imageUrl ? (
                                    <div className="relative w-full h-full">
                                        <img 
                                            src={newMission.imageUrl} 
                                            alt="Capa" 
                                            className="w-full h-full object-cover rounded-lg shadow-sm" 
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer">
                                            <p className="text-white text-xs font-bold flex items-center gap-1"><UploadCloud size={16}/> Alterar</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="text-gray-300 mb-2" size={40} />
                                        <span className="text-xs text-gray-500 text-center font-medium">Clique para upload</span>
                                        <span className="text-[10px] text-gray-400 text-center mt-1">(Max 2MB)</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 2: TAREFAS VINCULADAS (ORDENAÇÃO) */}
                    <section className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#006494] font-bold text-xs uppercase tracking-widest">
                                <Briefcase size={14} /> Tarefas Vinculadas
                            </div>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                Arraste para reordenar
                            </span>
                        </div>

                        {loadingTasks ? (
                            <div className="py-8 flex justify-center text-gray-400">
                                <Loader className="animate-spin" size={20} />
                            </div>
                        ) : linkedTasks.length > 0 ? (
                            <Reorder.Group axis="y" values={linkedTasks} onReorder={setLinkedTasks} className="space-y-2">
                                <AnimatePresence>
                                    {linkedTasks.map((task) => (
                                        <Reorder.Item 
                                            key={task.id} 
                                            value={task}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                        >
                                            <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-[#006494] transition-colors cursor-grab active:cursor-grabbing group relative pr-12">
                                                <div className="text-gray-300 group-hover:text-[#006494]">
                                                    <GripVertical size={20} />
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        {task.tipo === 'administrativa' && <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><FileText size={10}/> Documento</span>}
                                                        {task.tipo === 'social' && <span className="bg-purple-50 text-purple-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Camera size={10}/> Social</span>}
                                                        {task.tipo === 'conhecimento' && <span className="bg-indigo-50 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><CheckCircle size={10}/> Quiz</span>}
                                                        {(!task.tipo || task.tipo === 'padrao') && <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold">Padrão</span>}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-700 line-clamp-1">{task.titulo}</p>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                                    <Trophy size={12} className="text-orange-500" />
                                                    {task.pontos} XP
                                                </div>

                                                {/* Botão de Excluir */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Evita ativar o drag
                                                        handleDeleteLinkedTask(task.id);
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir tarefa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </AnimatePresence>
                            </Reorder.Group>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 font-medium">Nenhuma tarefa vinculada.</p>
                                <p className="text-xs text-gray-400 mt-1">Crie tarefas na aba "Tarefas" e vincule a esta missão.</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl sticky bottom-0 z-20">
                    <button onClick={handleModalClose} disabled={isLoading} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors uppercase tracking-wide">Cancelar</button>
                    <button onClick={onSaveWrapper} disabled={isLoading || uploading} className="px-8 py-2.5 rounded-xl bg-[#006494] text-white font-bold shadow-lg hover:brightness-90 transition-all flex items-center gap-2 text-xs uppercase tracking-wide">
                        {isLoading || uploading ? <Loader size={16} className="animate-spin" /> : null}
                        {isEditing ? "Salvar" : "Criar"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MissionModal;