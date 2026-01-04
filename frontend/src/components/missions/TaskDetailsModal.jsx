import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    X, Save, Plus, Trash2, HelpCircle, CheckSquare, List, 
    FileText, Camera, LayoutList, Link 
} from 'lucide-react';

const TaskQuizModal = ({ 
    task, 
    setTask, 
    handleSave, 
    handleClose, 
    isEditing, 
    isLoading, 
    categories, 
    missions 
}) => {
    
    // --- MANIPULAÇÃO GERAL ---
    const handleChange = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    // --- LÓGICA DE QUIZ ---
    const handleAddQuestion = () => {
        const newQuestion = {
            enunciado: "",
            tipo: "multipla_escolha",
            opcoes: ["", "", "", ""],
            resposta_correta: ""
        };
        
        const currentQuiz = task.quiz || { perguntas: [] };
        // Tenta usar a estrutura existente, mas padroniza para 'perguntas'
        const currentQuestions = currentQuiz.perguntas || currentQuiz.questions || [];
        
        setTask(prev => ({
            ...prev,
            quiz: {
                ...currentQuiz,
                perguntas: [...currentQuestions, newQuestion]
            }
        }));
    };

    const handleRemoveQuestion = (index) => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const currentQuestions = currentQuiz.perguntas || currentQuiz.questions || [];
        const updatedQuestions = currentQuestions.filter((_, i) => i !== index);
        
        setTask(prev => ({
            ...prev,
            quiz: { ...currentQuiz, perguntas: updatedQuestions }
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const currentQuestions = [...(currentQuiz.perguntas || currentQuiz.questions || [])];
        
        if (currentQuestions[index]) {
            currentQuestions[index] = { ...currentQuestions[index], [field]: value };
            
            setTask(prev => ({
                ...prev,
                quiz: { ...currentQuiz, perguntas: currentQuestions }
            }));
        }
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const currentQuestions = [...(currentQuiz.perguntas || currentQuiz.questions || [])];
        
        if (currentQuestions[qIndex]) {
            const currentOptions = [...(currentQuestions[qIndex].opcoes || ["", "", "", ""])];
            currentOptions[oIndex] = value;
            currentQuestions[qIndex].opcoes = currentOptions;

            setTask(prev => ({
                ...prev,
                quiz: { ...currentQuiz, perguntas: currentOptions }
            }));
        }
    };
    
    // --- LÓGICA SOCIAL (para Admin) ---
    const renderSocialFields = () => {
        // Se a tarefa já possui evidências de submissão (e o tipo é social), 
        // o administrador pode ver o link que foi enviado pelo usuário
        const evidenceLink = task.evidencias?.link;
        
        return (
            <div className="space-y-4 mt-6">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-900">
                    <h4 className="font-bold flex items-center gap-2 text-sm"><Camera size={16}/> Configuração Social</h4>
                    <p className="text-xs mt-1">Esta tarefa exige um link de postagem (Ex: LinkedIn, Instagram).</p>
                </div>

                {evidenceLink && isEditing && (
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Link Submetido pelo Usuário</label>
                        <a 
                            href={evidenceLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-white border border-purple-200 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors text-sm font-medium"
                        >
                            <Link size={16} /> 
                            {evidenceLink.length > 50 ? evidenceLink.substring(0, 47) + '...' : evidenceLink}
                        </a>
                    </div>
                )}
            </div>
        );
    };


    // --- HANDLER DE SALVAMENTO BLINDADO ---
    const onSaveWrapper = () => {
        const taskToSave = { ...task };

        // Correção de Categoria: Remove objeto e força NULL se vazio
        delete taskToSave.categoria;
        if (!taskToSave.categoria_id || taskToSave.categoria_id === "0" || taskToSave.categoria_id === 0) {
            taskToSave.categoria_id = null;
        }

        // Prepara dados de Quiz para o backend. O backend irá manipular a criação/atualização
        // das tabelas 'quizzes' e 'PerguntaQuiz' (como corrigido no taskController.js)
        const currentQuiz = task.quiz || {};
        const questions = currentQuiz.perguntas || currentQuiz.questions || [];

        if (task.tipo === 'conhecimento') {
            // Garante que o objeto quiz.perguntas vai no corpo da requisição
            taskToSave.quiz = { perguntas: questions }; 
            // O campo 'requisitos' é mantido para compatibilidade, mas o back usa a estrutura 'quiz'
            taskToSave.requisitos = JSON.stringify({ perguntas: questions }); 
        } else {
             // Garante que quiz e requisitos sejam limpos se o tipo não for quiz
             delete taskToSave.quiz;
             taskToSave.requisitos = null;
        }

        handleSave(taskToSave);
    };

    // --- COMPONENTE DE CARD DE SELEÇÃO ---
    const TypeCard = ({ value, label, icon: Icon, activeColor }) => (
        <div 
            onClick={() => handleChange('tipo', value)}
            className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-24 ${
                task.tipo === value 
                ? `border-${activeColor}-500 bg-${activeColor}-50 text-${activeColor}-700 shadow-sm ring-1 ring-${activeColor}-200` 
                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'
            }`}
        >
            <Icon size={24} className={task.tipo === value ? '' : 'opacity-50'} />
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            {task.tipo === value && (
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${activeColor}-500`} />
            )}
        </div>
    );

    // Renderiza inputs de quiz
    const renderQuizFields = () => {
        const currentQuiz = task.quiz || { perguntas: [] };
        const questions = currentQuiz.perguntas || currentQuiz.questions || [];

        return (
            <div className="space-y-6 mt-6">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <List size={16} /> Perguntas do Quiz
                    </h3>
                    <button 
                        type="button"
                        onClick={handleAddQuestion}
                        className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={12} /> Adicionar Pergunta
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">O quiz está vazio.</p>
                        <p className="text-xs text-gray-400">Adicione perguntas para desafiar os usuários.</p>
                    </div>
                ) : (
                    questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative group hover:border-indigo-200 transition-colors">
                            <button 
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Remover pergunta"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="space-y-4 pr-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pergunta {qIndex + 1}</label>
                                    <input 
                                        type="text" 
                                        value={q.enunciado || ""}
                                        onChange={(e) => handleQuestionChange(qIndex, 'enunciado', e.target.value)}
                                        className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                        placeholder="Digite o enunciado da pergunta..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(q.opcoes || ["", "", "", ""]).map((opt, oIndex) => (
                                        <div key={oIndex} className={`flex items-center gap-2 p-1 rounded-lg border transition-colors ${q.resposta_correta === opt && opt !== "" ? 'border-green-300 bg-green-50' : 'border-transparent'}`}>
                                            <button
                                                type="button"
                                                onClick={() => handleQuestionChange(qIndex, 'resposta_correta', opt)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${q.resposta_correta === opt && opt !== "" ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                title="Clique para definir como correta"
                                            >
                                                {String.fromCharCode(65 + oIndex)}
                                            </button>
                                            <input 
                                                type="text" 
                                                value={opt || ""}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                className="w-full p-2 text-sm bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none"
                                                placeholder={`Alternativa ${oIndex + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide font-medium">Configure os detalhes da atividade</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>

                {/* Body Scrollable */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
                    
                    {/* SELEÇÃO DE TIPO (CARDS) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <TypeCard value="padrao" label="Padrão" icon={CheckSquare} activeColor="gray" />
                        <TypeCard value="administrativa" label="Documento" icon={FileText} activeColor="blue" />
                        <TypeCard value="social" label="Social" icon={Camera} activeColor="purple" />
                        <TypeCard value="conhecimento" label="Quiz" icon={HelpCircle} activeColor="indigo" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Título</label>
                            <input 
                                type="text"
                                value={task.titulo || ""}
                                onChange={(e) => handleChange('titulo', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006494]/20 focus:border-[#006494] outline-none font-bold text-gray-700 transition-all"
                                placeholder="Ex: Contrato assinado"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Descrição</label>
                            <textarea 
                                value={task.descricao || ""}
                                onChange={(e) => handleChange('descricao', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006494]/20 focus:border-[#006494] outline-none text-sm min-h-[80px] transition-all resize-none"
                                placeholder="Instruções para o usuário..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Missão</label>
                            <div className="relative">
                                <LayoutList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select 
                                    value={task.missao_id || task.mission_id || ""}
                                    onChange={(e) => handleChange('missao_id', Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006494]/20 outline-none text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Selecione...</option>
                                    {missions.map(m => (
                                        <option key={m.id} value={m.id}>{m.titulo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Categoria (Opcional)</label>
                            <select 
                                value={task.categoria_id ?? ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleChange('categoria_id', val === "" ? null : Number(val));
                                }}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006494]/20 outline-none text-sm cursor-pointer"
                            >
                                <option value="">Nenhuma</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Pontos (XP)</label>
                            <input 
                                type="number"
                                value={task.pontos || 0}
                                onChange={(e) => handleChange('pontos', Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006494]/20 outline-none text-sm font-bold text-[#006494]"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Área de Quiz Condicional */}
                    {(task.tipo === 'conhecimento' || (task.quiz && Object.keys(task.quiz).length > 0)) && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 border-t border-indigo-100 pt-6"
                        >
                            <div className="flex items-center gap-3 mb-2 text-indigo-900 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                                    <HelpCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Configuração do Quiz</h3>
                                    <p className="text-xs text-indigo-700/70">Defina as perguntas e a resposta correta para pontuação automática.</p>
                                </div>
                            </div>
                            {renderQuizFields()}
                        </motion.div>
                    )}

                    {/* Área Social Condicional */}
                    {task.tipo === 'social' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 border-t border-purple-100 pt-6"
                        >
                            {renderSocialFields()}
                        </motion.div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors uppercase tracking-wide"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        onClick={onSaveWrapper}
                        className="px-8 py-3 text-xs font-bold text-white bg-[#006494] hover:bg-[#2a385f] rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 uppercase tracking-wide hover:-translate-y-0.5 active:translate-y-0"
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="animate-spin">⌛</span> : <Save size={16} />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskQuizModal;