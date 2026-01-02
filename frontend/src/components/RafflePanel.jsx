import React from 'react';
import { Gift, Ticket, Zap, Clock, TrendingUp, Award } from 'lucide-react';

// ===================================================================
// DADOS MOCKADOS
// ===================================================================

const MOCK_USER_STATS = {
    totalPoints: 540, // Mantido do CareerPanel
    pointsPerTicket: 20, // 20 pontos = 1 ticket
    ranking: 12,
};

const MOCK_RAFFLES = [
    {
        id: 1,
        name: "Vale Presente Amazon R$500",
        description: "Um voucher para usar como quiser!",
        requiredTickets: 10,
        endDate: "2025-12-15T10:00:00",
        totalTickets: 250,
        currentTickets: 120,
        userTickets: 6,
    },
    {
        id: 2,
        name: "Kit Home Office Premium",
        description: "Mousepad ergonômico e fone de ouvido JBL.",
        requiredTickets: 5,
        endDate: "2025-11-30T10:00:00",
        totalTickets: 500,
        currentTickets: 450,
        userTickets: 10,
    },
];

const MOCK_HISTORY = [
    {
        prize: "Headset Gamer de Última Geração",
        winner: "Ana Clara S.",
        date: "Outubro/2025"
    },
    {
        prize: "Jantar para 2 em Restaurante Top",
        winner: "Ronaldo F.",
        date: "Setembro/2025"
    },
];

// ===================================================================
// FUNÇÕES AUXILIARES
// ===================================================================

/**
 * Calcula os tickets máximos que o usuário pode gerar.
 */
const calculateMaxTickets = (points, pointsPerTicket) => {
    return Math.floor(points / pointsPerTicket);
};

/**
 * Componente simples de contagem regressiva (simplificada para exibição)
 */
const Countdown = ({ targetDate }) => {
    // Lógica real envolveria useEffect e setInterval, aqui é só para mock
    const timeLeft = new Date(targetDate).getTime() - Date.now();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
        <div className="flex items-center text-sm font-semibold text-red-600 bg-red-50 p-1.5 rounded-full">
            <Clock className="w-4 h-4 mr-1.5" />
            {days > 0 ? `${days} dias e ${hours}h` : `${hours} horas`}
        </div>
    );
};

/**
 * Componente para o card de estatística principal (reutilizado do CareerPanel)
 */
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center">
            <div className="text-left">
                <h2 className="text-sm font-medium text-gray-500">{title}</h2>
                <p className={`text-3xl font-extrabold ${color} mt-1`}>{value}</p>
            </div>
            <div className={`p-2 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>
    </div>
);

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function RafflePanel() {
    const maxTickets = calculateMaxTickets(MOCK_USER_STATS.totalPoints, MOCK_USER_STATS.pointsPerTicket);
    const currentTicketsAvailable = maxTickets - MOCK_RAFFLES.reduce((sum, raffle) => sum + raffle.userTickets, 0);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-2 flex items-center">
                <Gift className="w-8 h-8 mr-3 text-red-500" /> Sorteio de Prêmios
            </h1>

            {/* ------------------ STATUS DO USUÁRIO ------------------ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu Status na Competição</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    title="Pontos Acumulados"
                    value={`${MOCK_USER_STATS.totalPoints} pts`}
                    icon={Zap}
                    color="text-yellow-600"
                />

                <StatCard
                    title="Tickets Disponíveis"
                    value={`${currentTicketsAvailable} tickets`}
                    icon={Ticket}
                    color="text-green-600"
                />

                <StatCard
                    title="Ranking Geral"
                    value={`#${MOCK_USER_STATS.ranking} de 250`}
                    icon={TrendingUp}
                    color="text-blue-600"
                />
            </div>

            <hr className="my-10" />

            {/* ------------------ PRÓXIMOS SORTEIOS ------------------ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-indigo-600" /> Prêmios Atuais ({MOCK_RAFFLES.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {MOCK_RAFFLES.map((raffle) => (
                    <div key={raffle.id} className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-indigo-600 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{raffle.name}</h3>
                            <p className="text-gray-600 mb-4">{raffle.description}</p>
                        </div>

                        <div>
                            {/* Barra de Progresso */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm font-medium text-gray-600">
                                    <span>Tickets Vendidos: {raffle.currentTickets} / {raffle.totalTickets}</span>
                                    <span>Seus Tickets: <strong className="text-indigo-600">{raffle.userTickets}</strong></span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
                                        style={{ width: `${(raffle.currentTickets / raffle.totalTickets) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t">
                                <Countdown targetDate={raffle.endDate} />
                                <button className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                                    disabled={currentTicketsAvailable < raffle.requiredTickets}>
                                    Comprar {raffle.requiredTickets} Tickets ({raffle.requiredTickets * MOCK_USER_STATS.pointsPerTicket} pts)
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <hr className="my-10" />

            {/* ------------------ HISTÓRICO DE PRÊMIOS ------------------ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-red-600" /> Vencedores Anteriores
            </h2>
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prêmio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês do Sorteio</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_HISTORY.map((item, index) => (
                            <tr key={index} className="hover:bg-indigo-50/50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.prize}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.winner}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}