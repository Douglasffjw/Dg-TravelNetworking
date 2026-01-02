// src/components/AdminPanel/AdminMissions/QuizForm.jsx

import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

// Este componente recebe a missão e o setter como props
const QuizForm = ({ newMission, setNewMission, isLoading }) => {
    if (!newMission.quiz) return null; // Não renderiza se o quiz não estiver ativo

    const DEFAULT_QUESTION = { question: '', options: ["", "", "", ""], correctIndex: 0 };
    const questions = Array.isArray(newMission.quiz.questions) && newMission.quiz.questions.length > 0
        ? newMission.quiz.questions
        : [DEFAULT_QUESTION];
    const quiz = { questions };

    const setQuiz = (updatedQuiz) => {
        setNewMission({
            ...newMission,
            quiz: updatedQuiz,
        });
    };

    const handleAddQuestion = () => {
        setQuiz({ questions: [...questions, { ...DEFAULT_QUESTION }] });
    };

    const handleRemoveQuestion = (qIndex) => {
        if (questions.length > 1) {
            setQuiz({ questions: questions.filter((_, i) => i !== qIndex) });
        }
    };

    const handleUpdateQuestion = (qIndex, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
        setQuiz({ questions: updatedQuestions });
    };

    const handleUpdateOption = (qIndex, optIndex, value) => {
        const updatedQuestions = [...questions];
        const updatedOptions = [...updatedQuestions[qIndex].options];
        updatedOptions[optIndex] = value;
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
        setQuiz({ questions: updatedQuestions });
    };

    const handleAddOption = (qIndex) => {
        const question = questions[qIndex];
        if (question.options.length < 6) {
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex] = {
                ...question,
                options: [...question.options, ""]
            };
            setQuiz({ questions: updatedQuestions });
        }
    };

    const handleRemoveOption = (qIndex, optIndex) => {
        const question = questions[qIndex];
        const updatedOptions = question.options.filter((_, i) => i !== optIndex);
        const correctedIndex = Math.min(
            Math.max(0, question.correctIndex - (question.correctIndex > optIndex ? 1 : 0)),
            Math.max(0, updatedOptions.length - 1),
        );

        const updatedQuestions = [...questions];
        updatedQuestions[qIndex] = {
            ...question,
            options: updatedOptions,
            correctIndex: correctedIndex,
        };
        setQuiz({ questions: updatedQuestions });
    };

    return (
        <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-800">Configuração do Quiz</h4>
                <button
                    onClick={handleAddQuestion}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    disabled={isLoading}
                >
                    <Plus size={16} /> Adicionar Pergunta
                </button>
            </div>

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg bg-white space-y-3">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-gray-700">Pergunta {qIndex + 1}</h5>
                        {questions.length > 1 && (
                            <button
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="text-red-500 hover:text-red-700 p-1"
                                disabled={isLoading}
                                title="Remover pergunta"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Pergunta do Quiz (Ex: Qual é a capital da França?)"
                        className="w-full border p-3 rounded-lg"
                        value={q.question || ''}
                        onChange={(e) => handleUpdateQuestion(qIndex, "question", e.target.value)}
                        disabled={isLoading}
                    />
                    
                    <div className="space-y-2">
                        {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name={`correct-option-${qIndex}`}
                                    checked={q.correctIndex === optIndex}
                                    onChange={() => handleUpdateQuestion(qIndex, "correctIndex", optIndex)}
                                    className="w-4 h-4 text-green-600"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    placeholder={`Opção ${optIndex + 1}`}
                                    className={`flex-1 border p-2 rounded ${
                                        q.correctIndex === optIndex ? 'border-green-400 bg-green-50' : 'border-gray-300'
                                    }`}
                                    value={opt}
                                    onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                                    disabled={isLoading}
                                />
                                {q.options.length > 2 && (
                                    <button
                                        onClick={() => handleRemoveOption(qIndex, optIndex)}
                                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {q.options.length < 6 && (
                        <button
                            onClick={() => handleAddOption(qIndex)}
                            className="text-sm text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <Plus size={16} /> Adicionar Opção
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default QuizForm;