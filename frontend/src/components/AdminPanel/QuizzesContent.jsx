// src/components/AdminPanel/QuizzesContent.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Loader, AlertTriangle, CheckSquare, Tag, X, Edit, Trash2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuizzes, fetchTasksForSelect, createQuizApi, createQuizQuestion, updateQuizApi, deleteQuizApi, updateQuizQuestion } from '../../api/apiFunctions';

const INITIAL_QUESTION = {
    enunciado: '',
    alternativas: ['', '', '', ''],
    correctIndex: 0,
    questionId: null,
};

const INITIAL_FORM = {
    titulo: '',
    descricao: '',
    tarefa_id: '',
    perguntas: [{ ...INITIAL_QUESTION }],
    ativo: true,
    quizId: null,
};

export default function QuizzesContent() {
    const [quizzes, setQuizzes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [isEditing, setIsEditing] = useState(false);

    const taskLabel = (quiz) => {
        const found = tasks.find(t => String(t.id) === String(quiz.tarefa_id));
        return found?.titulo || `Tarefa #${quiz.tarefa_id}`;
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [quizData, taskSelect] = await Promise.all([
                fetchQuizzes(),
                fetchTasksForSelect().catch(() => []),
            ]);
            setQuizzes(Array.isArray(quizData) ? quizData : []);
            setTasks(Array.isArray(taskSelect) ? taskSelect : []);
        } catch (err) {
            setError(err?.message || 'Erro ao carregar quizzes.');
            console.error('Erro ao carregar quizzes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetForm = () => setForm(INITIAL_FORM);

    const handleOpen = () => {
        resetForm();
        setIsEditing(false);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        resetForm();
        setIsEditing(false);
    };

    const hydrateFromQuiz = (quiz) => {
        const perguntas = Array.isArray(quiz.perguntas) && quiz.perguntas.length > 0
            ? quiz.perguntas.map(p => {
                let alternativas = ['', '', '', ''];
                if (p?.opcoes) {
                    alternativas = typeof p.opcoes === 'string' 
                        ? JSON.parse(p.opcoes)
                        : p.opcoes;
                }
                while (alternativas.length < 4) {
                    alternativas.push('');
                }
                const correctIndex = p?.resposta_correta
                    ? alternativas.findIndex(a => a === p.resposta_correta)
                    : 0;
                return {
                    enunciado: p?.enunciado || '',
                    alternativas,
                    correctIndex: correctIndex >= 0 ? correctIndex : 0,
                    questionId: p?.id || null,
                };
            })
            : [{ ...INITIAL_QUESTION }];
        
        setForm({
            titulo: quiz.titulo || '',
            descricao: quiz.descricao || '',
            tarefa_id: quiz.tarefa_id || quiz.tarefa?.id || '',
            perguntas,
            ativo: quiz.ativa ?? true,
            quizId: quiz.id,
        });
    };

    const handleEdit = (quiz) => {
        hydrateFromQuiz(quiz);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (quizId) => {
        if (!window.confirm('Deseja excluir este quiz? Esta ação é irreversível.')) return;
        try {
            setIsSaving(true);
            await deleteQuizApi(quizId);
            await loadData();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Falha ao excluir quiz: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddQuestion = () => {
        setForm(prev => ({ ...prev, perguntas: [...prev.perguntas, { ...INITIAL_QUESTION }] }));
    };

    const handleRemoveQuestion = (qIndex) => {
        if (form.perguntas.length > 1) {
            setForm(prev => ({ ...prev, perguntas: prev.perguntas.filter((_, i) => i !== qIndex) }));
        }
    };

    const handleQuestionChange = (qIndex, field, value) => {
        setForm(prev => {
            const perguntas = [...prev.perguntas];
            perguntas[qIndex] = { ...perguntas[qIndex], [field]: value };
            return { ...prev, perguntas };
        });
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        setForm(prev => {
            const perguntas = [...prev.perguntas];
            const alternativas = [...perguntas[qIndex].alternativas];
            alternativas[optIndex] = value;
            perguntas[qIndex] = { ...perguntas[qIndex], alternativas };
            return { ...prev, perguntas };
        });
    };

    const handleAddOption = (qIndex) => {
        setForm(prev => {
            if (prev.perguntas[qIndex].alternativas.length >= 6) return prev;
            const perguntas = [...prev.perguntas];
            perguntas[qIndex] = {
                ...perguntas[qIndex],
                alternativas: [...perguntas[qIndex].alternativas, '']
            };
            return { ...prev, perguntas };
        });
    };

    const handleRemoveOption = (qIndex, optIndex) => {
        setForm(prev => {
            const perguntas = [...prev.perguntas];
            const question = perguntas[qIndex];
            const alternativas = question.alternativas.filter((_, i) => i !== optIndex);
            const correctedIndex = Math.min(
                Math.max(0, question.correctIndex - (question.correctIndex > optIndex ? 1 : 0)),
                Math.max(0, alternativas.length - 1)
            );
            perguntas[qIndex] = { ...question, alternativas, correctIndex: correctedIndex };
            return { ...prev, perguntas };
        });
    };

    const validate = () => {
        if (!form.titulo?.trim()) return 'Preencha o título do quiz.';
        if (!form.tarefa_id) return 'Selecione a tarefa vinculada.';
        
        for (let i = 0; i < form.perguntas.length; i++) {
            const q = form.perguntas[i];
            if (!q.enunciado?.trim()) return `Pergunta ${i + 1}: Informe o enunciado.`;
            const filled = q.alternativas.map(a => a?.trim()).filter(Boolean);
            if (filled.length < 2) return `Pergunta ${i + 1}: Informe pelo menos duas alternativas.`;
            if (q.correctIndex == null || q.correctIndex < 0 || q.correctIndex >= q.alternativas.length) {
                return `Pergunta ${i + 1}: Selecione a resposta correta.`;
            }
            if (!q.alternativas[q.correctIndex]?.trim()) {
                return `Pergunta ${i + 1}: A alternativa marcada como correta não pode estar vazia.`;
            }
        }
        return null;
    };

    const handleSave = async () => {
        const errMsg = validate();
        if (errMsg) {
            alert(errMsg);
            return;
        }
        setIsSaving(true);
        try {
            const quizPayload = {
                titulo: form.titulo,
                descricao: form.descricao,
                tarefa_id: Number(form.tarefa_id),
                ativo: form.ativo,
            };

            let quizId;
            if (isEditing && form.quizId) {
                await updateQuizApi(form.quizId, quizPayload);
                quizId = form.quizId;
                // Atualiza/cria cada pergunta
                for (const q of form.perguntas) {
                    if (q.questionId) {
                        await updateQuizQuestion(quizId, q.questionId, {
                            enunciado: q.enunciado,
                            alternativas: q.alternativas,
                            resposta_correta: q.alternativas[q.correctIndex],
                        });
                    } else {
                        await createQuizQuestion(quizId, {
                            enunciado: q.enunciado,
                            alternativas: q.alternativas,
                            resposta_correta: q.alternativas[q.correctIndex],
                        });
                    }
                }
            } else {
                const createdQuiz = await createQuizApi(quizPayload);
                quizId = createdQuiz.id;
                // Cria todas as perguntas
                for (const q of form.perguntas) {
                    await createQuizQuestion(quizId, {
                        enunciado: q.enunciado,
                        alternativas: q.alternativas,
                        resposta_correta: q.alternativas[q.correctIndex],
                    });
                }
            }
            await loadData();
            handleClose();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Falha ao salvar quiz: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader size={32} className="animate-spin text-[#394C97] mb-4" />
                <p className="text-gray-500 font-medium text-sm">Carregando quizzes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16 pt-12">
            <div className="space-y-6 mb-10">
                <div className="bg-[#394C97] text-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="relative p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10"><HelpCircle size={24} /></div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.25em] text-blue-100/80">Painel de quizzes</p>
                                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">Quizzes</h2>
                                    <p className="text-sm text-blue-100/85 mt-1">Crie quizzes de múltipla escolha com uma única resposta correta.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="px-5 py-4 bg-white/10 rounded-xl border border-white/15 text-right">
                                    <p className="text-[11px] uppercase text-blue-100/80">Total de quizzes</p>
                                    <p className="text-4xl font-extrabold leading-none">{quizzes.length}</p>
                                </div>
                                <button
                                    onClick={handleOpen}
                                    className="bg-[#FE5900] text-white px-5 py-3 rounded-lg shadow-lg shadow-orange-500/30 hover:bg-[#d94d00] transition flex items-center gap-2 font-semibold whitespace-nowrap"
                                    disabled={isSaving}
                                >
                                    <Plus size={16} /> Novo Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                    {quizzes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-10 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-3 md:col-span-2 xl:col-span-3"
                        >
                            <div className="text-sm text-gray-500">Nenhum quiz criado ainda.</div>
                        </motion.div>
                    ) : (
                        quizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-indigo-100 flex items-center gap-1">
                                        <CheckSquare size={10} /> Quiz
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="flex items-center gap-1"><Tag size={12} /> {taskLabel(quiz)}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>Perguntas: {Array.isArray(quiz.perguntas) ? quiz.perguntas.length : 0}</span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{quiz.titulo}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.descricao || 'Sem descrição'}</p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>ID: {quiz.id}</span>
                                    <span className="font-semibold text-green-600">Ativo</span>
                                </div>

                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => handleEdit(quiz)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                                        disabled={isSaving}
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(quiz.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                                        disabled={isSaving}
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-[#394C97] mb-4 flex items-center gap-2">
                            <HelpCircle size={18}/> {isEditing ? 'Editar Quiz' : 'Novo Quiz'}
                        </h3>
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Título do Quiz *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Quiz de Segurança"
                                    className="w-full border p-3 rounded-lg"
                                    value={form.titulo}
                                    onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Descrição</label>
                                <textarea
                                    placeholder="Breve contexto do quiz (opcional)"
                                    rows={2}
                                    className="w-full border p-3 rounded-lg"
                                    value={form.descricao}
                                    onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Tarefa vinculada *</label>
                                <select
                                    className="w-full border p-3 rounded-lg"
                                    value={form.tarefa_id}
                                    onChange={(e) => setForm(prev => ({ ...prev, tarefa_id: e.target.value }))}
                                    disabled={isSaving}
                                >
                                    <option value="">Selecione a Tarefa vinculada*</option>
                                    {tasks.map(t => (
                                        <option key={t.id} value={t.id}>{t.titulo || t.id}</option>
                                    ))}
                                </select>
                                {tasks.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">Crie uma tarefa primeiro para vincular o quiz.</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2"><CheckSquare size={16}/> Perguntas</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                        disabled={isSaving}
                                    >
                                        <Plus size={14} /> Adicionar Pergunta
                                    </button>
                                </div>

                                {form.perguntas.map((q, qIndex) => (
                                    <div key={qIndex} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-semibold text-gray-700">Pergunta {qIndex + 1}</h5>
                                            {form.perguntas.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuestion(qIndex)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    disabled={isSaving}
                                                    title="Remover pergunta"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <input
                                            type="text"
                                            placeholder="Enunciado da pergunta"
                                            className="w-full border p-3 rounded-lg"
                                            value={q.enunciado}
                                            onChange={(e) => handleQuestionChange(qIndex, 'enunciado', e.target.value)}
                                            disabled={isSaving}
                                        />

                                        <div className="space-y-2">
                                            {q.alternativas.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name={`correct-option-${qIndex}`}
                                                        checked={q.correctIndex === optIndex}
                                                        onChange={() => handleQuestionChange(qIndex, 'correctIndex', optIndex)}
                                                        className="w-4 h-4 text-green-600"
                                                        disabled={isSaving}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={`Opção ${optIndex + 1}`}
                                                        className={`flex-1 border p-2 rounded ${
                                                            q.correctIndex === optIndex ? 'border-green-400 bg-green-50' : 'border-gray-300'
                                                        }`}
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                    {q.alternativas.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOption(qIndex, optIndex)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            disabled={isSaving}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {q.alternativas.length < 6 && (
                                            <button
                                                type="button"
                                                onClick={() => handleAddOption(qIndex)}
                                                className="text-sm text-green-600 hover:text-green-800 font-semibold flex items-center gap-1"
                                                disabled={isSaving}
                                            >
                                                <Plus size={14} /> Adicionar opção
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                            <button onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSaving}>Cancelar</button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-[#394C97] text-white rounded-lg font-semibold hover:bg-[#2f3f7a] flex items-center gap-2 disabled:opacity-70"
                                disabled={isSaving}
                            >
                                {isSaving && <Loader size={16} className="animate-spin" />}
                                Salvar Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
