// src/components/AdminPanel/AdminMissions/CategoryCard.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const CategoryCard = ({ category, onEdit, onDelete, onCreateTask }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-lg">{category.nome}</p>
                    {category.descricao ? <p className="text-sm text-gray-500">{category.descricao}</p> : null}
                    <div className="text-xs text-gray-400 mt-1">Ordem: {category.ordem} · {category.tarefas ? category.tarefas.length : 0} tarefas</div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setOpen(o => !o)} className="px-3 py-2 bg-gray-100 rounded-md">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    <button onClick={() => onCreateTask && onCreateTask(category)} className="px-3 py-2 bg-green-100 text-green-700 rounded-md">Criar Tarefa</button>
                    <button onClick={onEdit} className="px-3 py-2 text-blue-600 rounded-md">Editar</button>
                    <button onClick={onDelete} className="px-3 py-2 text-red-600 rounded-md"><Trash2 size={16} /></button>
                </div>
            </div>

            {open && (
                <div className="mt-4 border-t pt-4 space-y-3">
                    {(!category.tarefas || category.tarefas.length === 0) ? (
                        <div className="text-sm text-gray-500">Nenhuma tarefa nesta categoria.</div>
                    ) : (
                        category.tarefas.map(t => (
                            <div key={t.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                <div>
                                    <div className="font-medium">{t.titulo}</div>
                                    <div className="text-xs text-gray-500">Pontos: {t.pontos} · Ordem: {t.ordem}</div>
                                </div>
                                <div className="text-sm text-gray-600">{t.quiz ? 'Quiz' : (t.tipo || 'Comum')}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryCard;
