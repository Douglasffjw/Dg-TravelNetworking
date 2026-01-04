// src/components/AdminPanel/AdminMissions/TasksManagerModal.jsx

import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare } from 'lucide-react';

const TasksManagerModal = ({ mission, onClose, onSave, isLoading }) => {
    console.log('TasksManagerModal renderizado com mission:', mission);
    const [tasks, setTasks] = useState(mission?.steps || []);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPoints, setNewTaskPoints] = useState(0);

    const handleAddTask = () => {
        if (newTaskDescription.trim()) {
            setTasks([...tasks, {
                description: newTaskDescription,
                points: Number(newTaskPoints) || 0,
            }]);
            setNewTaskDescription('');
            setNewTaskPoints(0);
        }
    };

    const handleDeleteTask = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(tasks);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-[#006494] flex items-center gap-2">
                    <CheckSquare size={24} />
                    Gerenciar Tarefas: {mission?.title}
                </h2>

                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50">
                    <X size={24} />
                </button>

                <div className="space-y-4">
                    {/* Lista de Tarefas Existentes */}
                    {tasks && tasks.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Tarefas Atuais ({tasks.length})</p>
                            {tasks.map((task, index) => (
                                <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{task.description || 'Sem descrição'}</p>
                                        <p className="text-xs text-gray-500">{task.points || 0} pontos</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTask(index)}
                                        disabled={isLoading}
                                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Nenhuma tarefa adicionada ainda.</p>
                    )}

                    {/* Adicionar Nova Tarefa */}
                    <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Adicionar Nova Tarefa</p>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Descrição da tarefa"
                                className="w-full border border-gray-300 p-2 rounded-lg text-sm"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Pontos"
                                    className="w-24 border border-gray-300 p-2 rounded-lg text-sm"
                                    value={newTaskPoints}
                                    onChange={(e) => setNewTaskPoints(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleAddTask}
                                    disabled={isLoading || !newTaskDescription.trim()}
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                    <Plus size={16} /> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações do Modal */}
                <div className="mt-8 flex justify-end gap-4 border-t pt-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="bg-[#006494] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2f3f7a] shadow-md transition disabled:opacity-50"
                    >
                        Salvar Tarefas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TasksManagerModal;
