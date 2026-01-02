import React, { useState } from 'react';
import { Gift, Ticket, Zap, Clock, TrendingUp, Award, DollarSign, Headset, Monitor, ShoppingBag } from 'lucide-react';

// ===================================================================
// DADOS MOCKADOS (Adicionando uma propriedade 'imageMock' para visualização)
// ===================================================================

const MOCK_USER_STATS = {
    totalPoints: 540,
    pointsPerTicket: 20,
    ranking: 12,
};

const MOCK_RAFFLES = [
    {
        id: 1,
        name: "Vale Presente Amazon R$500",
        description: "Um voucher para usar como quiser em milhões de produtos.",
        requiredTickets: 10,
        endDate: "2025-12-15T10:00:00",
        totalTickets: 250,
        currentTickets: 180,
        userTickets: 6,
        // Mock para a imagem
        imageMock: { icon: DollarSign, color: 'from-green-400 to-green-600' }
    },
    {
        id: 2,
        name: "Kit Home Office Premium",
        description: "Mousepad ergonômico, fone de ouvido JBL e caneca térmica.",
        requiredTickets: 5,
        endDate: "2025-11-30T10:00:00",
        totalTickets: 500,
        currentTickets: 450,
        userTickets: 10,
        // Mock para a imagem
        imageMock: { icon: Headset, color: 'from-blue-400 to-blue-600' }
    },
    {
        id: 3,
        name: "Monitor Ultrawide de 34 polegadas",
        description: "Aumente sua produtividade e imersão no trabalho.",
        requiredTickets: 25,
        endDate: "2025-12-30T10:00:00",
        totalTickets: 100,
        currentTickets: 15,
        userTickets: 0,
        // Mock para a imagem
        imageMock: { icon: Monitor, color: 'from-purple-400 to-purple-600' }
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
// COMPONENTES AUXILIARES (Adaptados e Novos)
// ===================================================================

const Countdown = ({ targetDate }) => {
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

/**
 * NOVO COMPONENTE: Card Visual para um Prêmio
 */
const PrizeCard = ({ raffle, maxTickets, pointsPerTicket, currentTicketsAvailable }) => {
    const progress = (raffle.currentTickets / raffle.totalTickets) * 100;
    const IconComponent = raffle.imageMock.icon;
    const canBuy = currentTicketsAvailable >= raffle.requiredTickets;

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col h-full">
            {/* Mock da Imagem/Visual (Topo) */}
            <div className={`relative h-40 flex items-center justify-center bg-gradient-to-r ${raffle.imageMock.color} text-white`}>
                <IconComponent className="w-16 h-16 opacity-80" />
                <span className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {raffle.requiredTickets} TICKETS
                </span>
            </div>

            {/* Corpo do Card (Detalhes) */}
            <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{raffle.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{raffle.description}</p>
                </div>

                {/* Progresso e Usuário */}
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>{raffle.currentTickets}/{raffle.totalTickets} Tickets Vendidos</span>
                        <span className="text-indigo-600 font-bold">Seus: {raffle.userTickets}</span>
                    </div>
                </div>

                {/* Rodapé (Ação e Contagem) */}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                    <Countdown targetDate={raffle.endDate} />
                    <button
                        className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-colors ${canBuy ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                        disabled={!canBuy}
                    >
                        Comprar ({raffle.requiredTickets * pointsPerTicket} pts)
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// COMPONENTE PRINCIPAL (Página de Sorteios)
// ===================================================================

export default function RafflePanel() {
    const maxTickets = Math.floor(MOCK_USER_STATS.totalPoints / MOCK_USER_STATS.pointsPerTicket);
    const currentTicketsUsed = MOCK_RAFFLES.reduce((sum, raffle) => sum + raffle.userTickets, 0);
    const currentTicketsAvailable = maxTickets - currentTicketsUsed;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen pt-[90px]">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-2 flex items-center">
                <ShoppingBag className="w-8 h-8 mr-3 text-red-500" /> Centro de Recompensas
            </h1>

            {/* ------------------ STATUS DO USUÁRIO ------------------ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu Saldo e Ranking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Cards de Status (mantidos) */}
                <StatCard title="Pontos Acumulados" value={`${MOCK_USER_STATS.totalPoints} pts`} icon={Zap} color="text-yellow-600" />
                <StatCard title="Tickets Disponíveis" value={`${currentTicketsAvailable} tickets`} icon={Ticket} color="text-green-600" />
                <StatCard title="Ranking Geral" value={`#${MOCK_USER_STATS.ranking} de 250`} icon={TrendingUp} color="text-blue-600" />
            </div>

            <hr className="my-10" />

            {/* ------------------ PRÊMIOS ATUAIS (CARDS VISUAIS) ------------------ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-indigo-600" /> Próximos Sorteios ({MOCK_RAFFLES.length})
            </h2>

            {/* Renderiza os cards de prêmios em um grid dinâmico */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {MOCK_RAFFLES.map((raffle) => (
                    <PrizeCard
                        key={raffle.id}
                        raffle={raffle}
                        maxTickets={maxTickets}
                        pointsPerTicket={MOCK_USER_STATS.pointsPerTicket}
                        currentTicketsAvailable={currentTicketsAvailable}
                    />
                ))}
            </div>

            <hr className="my-10" />

            {/* ------------------ HISTÓRICO DE PRÊMIOS (Mantido) ------------------ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-red-600" /> Vencedores Anteriores
            </h2>
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                {/* Tabela de histórico (mantida) */}
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