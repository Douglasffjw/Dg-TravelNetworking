import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { Trophy, Zap, Plane, Calendar, CheckCircle } from 'lucide-react';

// Registro dos componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const PRIMARY_COLOR = '#394C97';
const ACCENT_COLOR = '#FE5900';

// ===================================================================
// DADOS MOCKADOS
// ===================================================================

const careerStats = {
  missionsCompleted: 18,
  totalPoints: 1200,
  tripsMade: 5,
  badgesEarned: ["Explorador", "Veterano", "Conquistador"],
  timeline: [
    { date: "03 de Novembro", event: "Missão 'Desafio da Serra' concluída" },
    { date: "06 de Novembro", event: "Viagem registrada: Maranguape - Guaramiranga" },
    { date: "09 de Novembro", event: "Conquista desbloqueada: 'Veterano'" },
  ],
};

// ===================================================================
// DADOS DOS GRÁFICOS
// ===================================================================

const missionsByDay = {
  labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  datasets: [
    {
      label: "Missões Concluídas",
      data: [3, 4, 2, 5, 3, 1, 0],
      backgroundColor: PRIMARY_COLOR,
      borderRadius: 6,
      hoverBackgroundColor: ACCENT_COLOR,
    },
  ],
};

const pointsByMonth = {
  labels: ["Agosto", "Setembro", "Outubro", "Novembro"],
  datasets: [
    {
      label: "Pontos Acumulados",
      data: [120, 160, 480, 1200],
      borderColor: PRIMARY_COLOR,
      backgroundColor: 'rgba(57, 76, 151, 0.1)',
      tension: 0.3,
      fill: true,
      pointBackgroundColor: PRIMARY_COLOR,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: ACCENT_COLOR,
      pointHoverBorderColor: PRIMARY_COLOR,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
};

const tripsByDestination = {
  labels: ["Guaramiranga", "Fortaleza", "Jericoacoara", "Canoa Quebrada"],
  datasets: [
    {
      label: "Viagens",
      data: [2, 1, 1, 1],
      backgroundColor: [PRIMARY_COLOR, ACCENT_COLOR, "#10B981", "#8B5CF6"],
      hoverOffset: 10,
      borderWidth: 0,
    },
  ],
};

// ===================================================================
// OPÇÕES DOS GRÁFICOS
// ===================================================================

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: { size: 12, family: 'Inter, sans-serif' },
        color: '#64748B',
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#1E293B',
      titleColor: '#fff',
      bodyColor: '#CBD5E1',
      titleFont: { size: 13, weight: 'bold' },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#94A3B8', font: { size: 11 } }
    },
    y: {
      grid: { color: '#F1F5F9', drawBorder: false },
      ticks: { color: '#94A3B8', font: { size: 11 }, padding: 10 }
    }
  }
};

const pieChartOptions = {
  ...commonChartOptions,
  scales: { x: { display: false }, y: { display: false } },
  plugins: {
    ...commonChartOptions.plugins,
    legend: { ...commonChartOptions.plugins.legend, position: 'right' }
  }
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function CareerPanel() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- BANNER SUPERIOR --- */}
      <div className="h-64 w-full bg-[#394C97] relative">
        <div className="absolute top-4 right-4 text-white/80 text-sm font-medium">
          Diário de Bordo
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pb-12 md:translate-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-white"
          >
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Trophy className="w-10 h-10 text-[#FE5900]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Diário de Bordo</h1>
              <p className="text-blue-100 text-lg mt-1">Acompanhe sua evolução e conquistas</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20 relative z-10">
        
        {/* 1. ESTATÍSTICAS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Missões Concluídas"
            value={careerStats.missionsCompleted}
            icon={CheckCircle}
            color="text-emerald-500"
            bgColor="bg-emerald-50"
            delay={0.1}
          />
          <StatCard
            title="Pontos Totais"
            value={careerStats.totalPoints}
            icon={Zap}
            color="text-[#FE5900]"
            bgColor="bg-orange-50"
            delay={0.2}
          />
          <StatCard
            title="Viagens Registradas"
            value={careerStats.tripsMade}
            icon={Plane}
            color="text-blue-500"
            bgColor="bg-blue-50"
            delay={0.3}
          />
        </div>

        {/* 2. CONQUISTAS E TIMELINE (AGORA LADO A LADO EM TELAS MÉDIAS) */}
        {/* Alterado de lg:grid-cols-3 para md:grid-cols-3 para economizar espaço vertical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
          >
            <h2 className="text-xl font-bold text-[#394C97] mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FE5900]" />
              Conquistas
            </h2>
            <div className="flex flex-wrap gap-2 content-start">
              {careerStats.badgesEarned.map((badge, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FE5900]"></span>
                  {badge}
                </span>
              ))}
              <div className="w-full mt-4 p-4 bg-gray-50 rounded-xl text-center border border-dashed border-gray-300">
                <p className="text-sm text-gray-400">Próxima: <span className="text-[#394C97] font-bold">Mestre das Serras</span></p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                   <div className="bg-[#394C97] h-1.5 rounded-full w-[80%]"></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-[#394C97] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FE5900]" />
              Últimas Atividades
            </h2>
            <div className="relative pl-4">
              <div className="absolute left-[21px] top-2 bottom-4 w-[2px] bg-gray-100"></div>
              <ul className="space-y-6">
                {careerStats.timeline.map((item, index) => (
                  <li key={index} className="relative flex items-start gap-4">
                    <div className="relative z-10 mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#394C97] ring-4 ring-white shadow-sm"></div>
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold text-base leading-none mb-1">
                        {item.event}
                      </p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* 3. GRÁFICOS (AGORA 2 POR LINHA EM TELAS MÉDIAS) */}
        {/* Alterado para md:grid-cols-2. Isso garante pelo menos 2 gráficos por linha em laptops/tablets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ChartCard title="Frequência de Missões" delay={0.6}>
            <Bar data={missionsByDay} options={commonChartOptions} />
          </ChartCard>

          <ChartCard title="Evolução de Pontos" delay={0.7}>
            <Line data={pointsByMonth} options={commonChartOptions} />
          </ChartCard>

          {/* Em telas médias, este gráfico ficará na segunda linha, ocupando metade ou tudo (opcional) */}
          <ChartCard title="Destinos Visitados" delay={0.8} className="md:col-span-2 lg:col-span-1 xl:col-span-1">
             {/* Usei md:col-span-2 para ele centralizar/encher a linha de baixo se sobrar, fica mais bonito */}
            <Pie data={tripsByDestination} options={pieChartOptions} />
          </ChartCard>
        </div>

      </div>
    </div>
  );
}

// ===================================================================
// COMPONENTES AUXILIARES
// ===================================================================

const StatCard = ({ title, value, icon: Icon, color, bgColor, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
  >
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
    </div>
    <div className={`p-4 rounded-xl ${bgColor}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, className = '', delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-80 flex flex-col ${className}`}
  >
    <h2 className="text-lg font-bold text-[#394C97] mb-6 flex items-center justify-between">
      {title}
    </h2>
    <div className="flex-grow w-full h-full min-h-0 relative">
      {children}
    </div>
  </motion.div>
);