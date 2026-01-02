// src/components/AdminPanel/AdminMissions/MissionTasksTab.jsx

import React from 'react';
import { Trash2 } from 'lucide-react';

const MissionTasksTab = ({ tasks = [], onDeleteTask, isLoading }) => {

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-gray-700 flex items-center gap-2">
                📋 Tarefas da Missão
            </h3>

            {tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border">
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{task.description || 'Sem descrição'}</p>
                                <p className="text-xs text-gray-500">{task.points || 0} pontos</p>
                            </div>
                            <button
                                onClick={() => onDeleteTask(index)}
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
        </div>
    );
};

export default MissionTasksTab;
