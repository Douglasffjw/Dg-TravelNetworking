import api from './api'; // Importa a instância configurada

const CARDS_BASE_URL = '/admin/cards';
const TASKS_ADMIN_BASE_URL = '/admin/tasks';
const QUIZZES_ADMIN_BASE_URL = '/admin/quizzes';

// --- ESTATÍSTICAS (Dashboard) ---
export const fetchStats = async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
};

// --- MISSÕES (CRUD) ---
export const fetchMissions = async () => {
    try {
        // Endpoint público para apps cliente (participante)
        const response = await api.get("/missions");
        return response.data;
    } catch (error) {
        console.error("Erro ao carregar missões:", error);
        throw error;
    }
};

// Versão administrativa (retorna tarefas/quizzes completos)
export const fetchMissionsAdmin = async () => {
    try {
        const response = await api.get("/admin/missions");
        return response.data;
    } catch (error) {
        console.error("Erro ao carregar missões (admin):", error);
        throw error;
    }
};

export const createMission = async (missionData) => {
    const response = await api.post("/admin/missions", missionData);
    return response.data.mission || response.data;
};

export const updateMission = async (id, missionData) => {
    const response = await api.put(`/admin/missions/${id}`, missionData);
    return response.data.mission || response.data;
};

export const deleteMissionApi = async (id) => {
    const response = await api.delete(`/admin/missions/${id}`);
    return response.data;
};

// --- GESTÃO DE PARTICIPANTES EM MISSÕES (NOVO) --- 
// Estas funções são usadas pelo MissionParticipantsModal
export const fetchMissionParticipants = async (missionId) => {
    const response = await api.get(`/admin/missions/${missionId}/participants`);
    return response.data;
};

export const addParticipantToMission = async (missionId, userId) => {
    const response = await api.post(`/admin/missions/${missionId}/participants`, { userId });
    return response.data;
};

export const removeParticipantFromMission = async (missionId, userId) => {
    const response = await api.delete(`/admin/missions/${missionId}/participants/${userId}`);
    return response.data;
};


// --- USUÁRIOS (CRUD) ---
export const fetchUsers = async () => {
    const response = await api.get("/admin/users");
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
};

export const deleteUserApi = async (id) => {
    await api.delete(`/admin/users/${id}`);
};


// --- CATEGORIAS DE TAREFAS (CRUD) ---
export const fetchCategories = async () => {
    const response = await api.get("/categorias-tarefas");
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await api.post("/categorias-tarefas", categoryData);
    return response.data.categoria || response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/categorias-tarefas/${id}`, categoryData);
    return response.data.categoria || response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categorias-tarefas/${id}`);
    return response.data;
};


// --- TAREFAS (CRUD) ---
export const fetchTasks = async () => {
    const response = await api.get(TASKS_ADMIN_BASE_URL);
    return response.data;
};

export const fetchTaskById = async (id) => {
    const response = await api.get(`${TASKS_ADMIN_BASE_URL}/${id}`);
    return response.data;
};

export const createTask = async (taskData) => {
    const payload = { ...taskData };
    // Normalize requisitos: ensure JSON serializable
    if (payload.requisitos !== undefined && payload.requisitos !== null) {
        if (typeof payload.requisitos === 'string') {
            try {
                payload.requisitos = JSON.parse(payload.requisitos);
            } catch (e) {
                payload.requisitos = payload.requisitos.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    } else {
        payload.requisitos = null;
    }

    const response = await api.post(TASKS_ADMIN_BASE_URL, payload);
    return response.data.task || response.data;
};

export const updateTask = async (id, taskData) => {
    const payload = { ...taskData };
    if (payload.requisitos !== undefined && payload.requisitos !== null) {
        if (typeof payload.requisitos === 'string') {
            try {
                payload.requisitos = JSON.parse(payload.requisitos);
            } catch (e) {
                payload.requisitos = payload.requisitos.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    } else {
        payload.requisitos = null;
    }

    const response = await api.put(`${TASKS_ADMIN_BASE_URL}/${id}`, payload);
    return response.data.task || response.data;
};

export const deleteTask = async (id) => {
    await api.delete(`${TASKS_ADMIN_BASE_URL}/${id}`);
};


// --- CARDS/SELOS (CRUD) ---
export const fetchCards = async () => {
    const response = await api.get(CARDS_BASE_URL);
    return response.data;
};

export const createCard = async (cardData) => {
    const response = await api.post(CARDS_BASE_URL, cardData);
    return response.data;
};

export const updateCard = async (id, cardData) => {
    const response = await api.put(`${CARDS_BASE_URL}/${id}`, cardData);
    return response.data;
};

export const deleteCard = async (id) => {
    await api.delete(`${CARDS_BASE_URL}/${id}`);
};


// --- QUIZZES (CRUD SIMPLIFICADO) ---
export const fetchQuizzes = async () => {
    const response = await api.get(QUIZZES_ADMIN_BASE_URL);
    return response.data;
};

export const createQuizApi = async (quizData) => {
    const response = await api.post(QUIZZES_ADMIN_BASE_URL, quizData);
    return response.data.quiz || response.data;
};

export const createQuizQuestion = async (quizId, questionData) => {
    const response = await api.post(`${QUIZZES_ADMIN_BASE_URL}/${quizId}/questions`, questionData);
    return response.data.pergunta || response.data;
};

export const updateQuizApi = async (quizId, quizData) => {
    const response = await api.put(`${QUIZZES_ADMIN_BASE_URL}/${quizId}`, quizData);
    return response.data.quiz || response.data;
};

export const deleteQuizApi = async (quizId) => {
    const response = await api.delete(`${QUIZZES_ADMIN_BASE_URL}/${quizId}`);
    return response.data;
};

export const updateQuizQuestion = async (quizId, questionId, questionData) => {
    const response = await api.put(`${QUIZZES_ADMIN_BASE_URL}/${quizId}/questions/${questionId}`, questionData);
    return response.data.pergunta || response.data;
};

export const deleteQuizQuestion = async (quizId, questionId) => {
    const response = await api.delete(`${QUIZZES_ADMIN_BASE_URL}/${quizId}/questions/${questionId}`);
    return response.data;
};


// --- FUNÇÕES AUXILIARES ---
export const fetchTasksForSelect = async () => {
    const response = await api.get(TASKS_ADMIN_BASE_URL);
    const tasks = response.data || [];
    return tasks.map(t => ({ id: t.id, titulo: t.titulo || t.descricao || `Tarefa ${t.id}` }));
};