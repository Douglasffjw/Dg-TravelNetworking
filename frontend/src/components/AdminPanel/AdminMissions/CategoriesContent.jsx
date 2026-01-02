import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, 
    Plus, 
    Loader, 
    AlertTriangle, 
    RefreshCw, 
    Layers, 
    FolderOpen,
    Edit2,
    Trash2,
    Check,
    X,
    MoreVertical,
    Sword,   // Novo import
    Users,   // Novo import
    Lock     // Novo import
} from 'lucide-react';

// --- MOCKS (NECESSÁRIOS PARA RODAR NO AMBIENTE DE VISUALIZAÇÃO) ---

// MOCK API FUNCTIONS
const fetchCategories = async () => [
    { id: 1, nome: "Segurança Ofensiva", descricao: "Pentesting e Red Teaming", icone: "sword", cor: "#ef4444" },
    { id: 2, nome: "Engenharia Social", descricao: "Phishing e OSINT", icone: "users", cor: "#3b82f6" },
    { id: 3, nome: "Criptografia", descricao: "Cifras e Hash", icone: "lock", cor: "#10b981" }
];
const createCategory = async (data) => ({ ...data, id: Math.random() });
const updateCategory = async (id, data) => ({ ...data, id });
const deleteCategory = async (id) => true;
const createTask = async (data) => true;
const updateTask = async (id, data) => true;
const fetchMissions = async () => [{ id: 1, titulo: "Missão Alpha" }];

// MOCK COMPONENTS COM CSS IMPLEMENTADO

// 1. CARD DE CATEGORIA (Estilo Light/Clean)
const CategoryCard = ({ category, onEdit, onDelete, onCreateTask }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group relative overflow-hidden">
        {/* Ações Hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button onClick={onEdit} className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors" title="Editar">
                <Edit2 size={16} />
            </button>
            <button onClick={onDelete} className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors" title="Excluir">
                <Trash2 size={16} />
            </button>
        </div>

        {/* Conteúdo */}
        <div className="flex items-start gap-4 mb-4">
            <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${category.cor}20`, color: category.cor }}
            >
                {/* Ícone Profissional Lucide */}
                {category.icone === 'sword' ? <Sword size={24} /> : category.icone === 'users' ? <Users size={24} /> : <Lock size={24} />}
            </div>
            <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-bold text-gray-800 text-lg truncate leading-tight">{category.nome}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{category.descricao}</p>
            </div>
        </div>

        {/* Botão de Ação */}
        <button 
            onClick={() => onCreateTask(category)} 
            className="w-full mt-2 py-2.5 bg-gray-50 hover:bg-[#394C97] border border-gray-100 hover:border-[#394C97] rounded-xl text-xs font-bold text-gray-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
        >
            <Plus size={14} className="group-hover/btn:scale-110 transition-transform" /> 
            Adicionar Tarefa
        </button>
    </div>
);

// 2. MODAL DE CATEGORIA
const CategoryModal = ({ onClose, onSave, isLoading, isEditing, category, setCategory }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5 block">Nome da Categoria</label>
                    <input 
                        value={category.nome} 
                        onChange={e => setCategory({...category, nome: e.target.value})}
                        placeholder="Ex: Segurança de Redes"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:border-[#394C97] focus:ring-2 focus:ring-[#394C97]/20 outline-none transition-all" 
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5 block">Descrição</label>
                    <textarea 
                        value={category.descricao} 
                        onChange={e => setCategory({...category, descricao: e.target.value})}
                        placeholder="Breve descrição sobre o tema..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:border-[#394C97] focus:ring-2 focus:ring-[#394C97]/20 outline-none transition-all h-28 resize-none" 
                    />
                </div>
                
                {/* Seletor de Cor Simplificado */}
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Cor de Destaque</label>
                    <div className="flex gap-3">
                        {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                            <button
                                key={color}
                                onClick={() => setCategory({...category, cor: color})}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${category.cor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-500 hover:text-gray-800 font-bold text-sm transition-colors">Cancelar</button>
                    <button 
                        onClick={() => onSave(category)} 
                        disabled={isLoading} 
                        className="px-6 py-2.5 bg-[#394C97] hover:bg-[#2d3a75] text-white rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-blue-900/10 transition-all disabled:opacity-70"
                    >
                        {isLoading ? <Loader className="animate-spin" size={16} /> : <Check size={16} />} 
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// 3. MODAL DE TAREFA (SIMULADO)
const TaskQuizModal = ({ handleClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white border border-gray-200 w-full max-w-lg rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader size={32} className="animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Editor de Tarefas</h3>
            <p className="text-gray-500 mb-6">Este modal seria carregado aqui para criar tarefas vinculadas.</p>
            <button onClick={handleClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                Fechar Simulação
            </button>
        </div>
    </div>
);

// --- CÓDIGO PRINCIPAL (INTEGRADO) ---

const INITIAL_CATEGORY_STATE = {
    nome: "",
    descricao: "",
    icone: "folder",
    cor: "#3b82f6",
    ordem: 0,
};

const CategoriesContent = () => {
    // ESTADOS
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Estado do Modal de Categoria
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(INITIAL_CATEGORY_STATE);
    
    // Estado do modal de Tarefa
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [isTaskSaving, setIsTaskSaving] = useState(false);
    const [missionsList, setMissionsList] = useState([]);

    // FUNÇÃO DE CARREGAMENTO (READ - GET)
    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            setError(`Falha ao carregar categorias: ${err.message || 'Erro de conexão'}`);
            console.error("Erro ao carregar categorias:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        (async () => {
            try {
                const ms = await fetchMissions();
                setMissionsList(ms);
            } catch (err) {
                // ignorar erro
            }
        })();
    }, []);


    // --- FUNÇÕES DE CRUD CATEGORIA ---

    const handleCreateEdit = async (data) => {
        setIsSaving(true);
        try {
            let result;
            if (isEditing && data.id) {
                result = await updateCategory(data.id, data);
                setCategories(categories.map(c => c.id === result.id ? result : c));
            } else {
                result = await createCategory(data);
                setCategories([...categories, result]);
            }
            setShowModal(false);
            setCurrentCategory(INITIAL_CATEGORY_STATE);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            alert(`Falha ao salvar categoria: ${errorMsg}`);
            console.error('Erro salvar categoria:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover esta categoria?')) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            alert(`Falha ao remover categoria: ${errorMsg}`);
        }
    };

    // --- Manipuladores de CRUD de Tarefas ---
    const openCreateTaskForCategory = (category) => {
        const empty = {
            missao_id: missionsList && missionsList.length > 0 ? missionsList[0].id : null,
            categoria_id: category.id,
            titulo: '',
            descricao: '',
            instrucoes: '',
            pontos: 0,
            tipo: null,
            dificuldade: 'facil',
            ordem: 0,
            ativa: true,
            requisitos: null,
            tarefa_anterior_id: null,
            quiz: null,
        };
        setCurrentTask(empty);
        setShowTaskModal(true);
    };

    const handleSaveTask = async (task) => {
        setIsTaskSaving(true);
        try {
            let res;
            if (task.id) {
                res = await updateTask(task.id, task);
            } else {
                res = await createTask(task);
            }
            await loadCategories();
            setShowTaskModal(false);
            setCurrentTask(null);
        } catch (err) {
            const message = err.response?.data?.error || err.message;
            alert(`Falha ao salvar tarefa: ${message}`);
        } finally {
            setIsTaskSaving(false);
        }
    };
    
    // --- RENDERIZAÇÃO ---

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100 mt-10 mx-6">
                <Loader size={32} className="animate-spin text-[#394C97] mb-4" /> 
                <p className="text-gray-500 font-medium text-sm">Carregando estrutura...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* --- BANNER SUPERIOR (COR RESTAURADA: #394C97) --- */}
            <div className="h-64 w-full bg-[#394C97] relative rounded-b-[2.5rem] md:rounded-b-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center pb-10 md:translate-y-2 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-5 text-white"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                            <Layers className="w-6 h-6 text-[#FE5900]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Categorias</h1>
                            <p className="text-blue-100/90 text-sm md:text-base mt-1 font-light">Organização estrutural das tarefas</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                
                {/* Header de Ações */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="bg-[#FE5900] px-4 py-2 rounded-xl text-sm text-white font-medium shadow-lg shadow-orange-900/10">
                        Total de Categorias: <span className="font-bold">{categories.length}</span>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setIsEditing(false); setCurrentCategory(INITIAL_CATEGORY_STATE); setShowModal(true); }}
                        className="bg-white text-[#394C97] px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wide transform hover:-translate-y-0.5 border border-gray-100"
                        disabled={isSaving}
                    >
                        <Plus size={16} strokeWidth={3} />
                        Nova Categoria
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
                        <button onClick={loadCategories} className="p-1.5 hover:bg-red-100 rounded-md transition-colors">
                            <RefreshCw size={14} />
                        </button>
                    </motion.div>
                )}

                {/* Grid de Categorias */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {categories.length === 0 && !error ? (
                            <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                                <FolderOpen size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">Nenhuma categoria cadastrada.</p>
                            </div>
                        ) : (
                            categories.map((cat, index) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <CategoryCard
                                        category={cat}
                                        onEdit={() => { setIsEditing(true); setCurrentCategory(cat); setShowModal(true); }}
                                        onDelete={() => handleDelete(cat.id)}
                                        onCreateTask={(c) => openCreateTaskForCategory(c)}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de Categoria */}
            {showModal && (
                <CategoryModal
                    category={currentCategory}
                    setCategory={setCurrentCategory}
                    onSave={handleCreateEdit}
                    onClose={() => { setShowModal(false); setIsEditing(false); setCurrentCategory(INITIAL_CATEGORY_STATE); }}
                    isEditing={isEditing}
                    isLoading={isSaving}
                />
            )}

            {/* Modal de Tarefa */}
            {showTaskModal && (
                <TaskQuizModal
                    handleClose={() => { setShowTaskModal(false); setCurrentTask(null); }}
                />
            )}
        </div>
    );
};

export default CategoriesContent;