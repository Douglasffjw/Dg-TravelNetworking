import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Map, 
  Calendar, 
  MapPin, 
  Ticket, 
  CheckCircle, 
  Clock, 
  Plane, 
  Globe,
  Compass
} from 'lucide-react';

// ===================================================================
// DADOS MOCKADOS
// ===================================================================

const travelStats = {
  totalTrips: 12,
  countries: 3,
  kilometers: "14.5k",
  nextTripIn: "15 dias"
};

const nextTrip = {
  destination: "Lençóis Maranhenses",
  date: "15 Dez - 20 Dez",
  status: "Confirmado",
  image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800",
  missions: [
    { id: 1, title: "Foto nas Dunas ao pôr do sol", points: 50, completed: false },
    { id: 2, title: "Mergulho na Lagoa Azul", points: 30, completed: false },
    { id: 3, title: "Experimentar Peixe local", points: 20, completed: true },
  ]
};

const pastTrips = [
  {
    id: 1,
    destination: "Guaramiranga",
    date: "03 Nov 2024",
    image: "https://images.unsplash.com/photo-1518182170546-0766ca6af38e?auto=format&fit=crop&q=80&w=800",
    badge: "Explorador da Serra"
  },
  {
    id: 2,
    destination: "Jericoacoara",
    date: "15 Ago 2024",
    image: "https://images.unsplash.com/photo-1570643033877-c93d8b5a0348?auto=format&fit=crop&q=80&w=800",
    badge: "Beach Lover"
  },
  {
    id: 3,
    destination: "Canoa Quebrada",
    date: "10 Jul 2024",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
    badge: "Aventureiro das Falésias"
  },
  {
    id: 4,
    destination: "Salvador",
    date: "02 Fev 2024",
    image: "https://images.unsplash.com/photo-1574007875932-d17b43a85b96?auto=format&fit=crop&q=80&w=800",
    badge: "Folião"
  }
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function Trips() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- BANNER SUPERIOR --- */}
      <div className="h-64 w-full bg-[#394C97] relative">
        <div className="absolute top-4 right-4 text-white/80 text-sm font-medium">
          Passaporte
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pb-12 md:translate-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-white"
          >
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Globe className="w-10 h-10 text-[#FE5900]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Passaporte de Viagens</h1>
              <p className="text-blue-100 text-lg mt-1">Explore seu histórico e planeje novas aventuras</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Overlap) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20 relative z-10">
        
        {/* 1. ESTATÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard title="Total de Viagens" value={travelStats.totalTrips} icon={Map} delay={0.1} />
          <StatCard title="Países Visitados" value={travelStats.countries} icon={Globe} delay={0.2} />
          <StatCard title="Km Percorridos" value={travelStats.kilometers} icon={Compass} delay={0.3} />
          <StatCard title="Próxima Trip" value={travelStats.nextTripIn} icon={Clock} highlight={true} delay={0.4} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA (2/3) - Próxima Viagem e Histórico */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Próxima Aventura (Estilo Ticket) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-[#394C97] mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#FE5900]" />
                Próximo Embarque
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                {/* Imagem do destino */}
                <div className="md:w-1/3 h-48 md:h-auto relative">
                  <img src={nextTrip.image} alt={nextTrip.destination} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-[#FE5900] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {nextTrip.status}
                  </div>
                </div>
                
                {/* Detalhes do Ticket */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between relative">
                  {/* Recorte Decorativo (Ticket effect) */}
                  <div className="hidden md:block absolute -left-3 top-1/2 w-6 h-6 bg-gray-50 rounded-full transform -translate-y-1/2"></div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Destino</p>
                        <h3 className="text-2xl font-bold text-gray-800">{nextTrip.destination}</h3>
                      </div>
                      <Plane className="w-8 h-8 text-gray-200 rotate-45" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mt-2 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                      <Calendar className="w-4 h-4 text-[#394C97]" />
                      <span className="text-sm font-medium">{nextTrip.date}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                    <p className="text-sm text-gray-500 mb-3 font-medium">Missões Disponíveis:</p>
                    <div className="space-y-2">
                      {nextTrip.missions.map(mission => (
                        <div key={mission.id} className="flex items-center gap-3 text-sm">
                          {mission.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                          )}
                          <span className={mission.completed ? "text-gray-400 line-through" : "text-gray-700"}>
                            {mission.title}
                          </span>
                          <span className="text-xs font-bold text-[#FE5900] bg-orange-50 px-2 py-0.5 rounded ml-auto">
                            +{mission.points}pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Histórico (Grid de Cards) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-[#394C97] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FE5900]" />
                Carimbos no Passaporte
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastTrips.map((trip) => (
                  <div key={trip.id} className="group bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{trip.destination}</h4>
                      <p className="text-xs text-gray-500 mb-2">{trip.date}</p>
                      <span className="inline-block bg-[#394C97]/10 text-[#394C97] text-xs px-2 py-1 rounded font-medium">
                        {trip.badge}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Botão Ver Mais */}
                <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#394C97] transition-colors cursor-pointer min-h-[100px]">
                  <span className="text-sm font-medium">+ Ver histórico completo</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* COLUNA DIREITA (1/3) - Widgets Auxiliares */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Wishlist / Planejamento */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-[#394C97]" />
                Wishlist 2025
              </h3>
              <ul className="space-y-4">
                <WishlistItem place="Machu Picchu" country="Peru" progress={75} />
                <WishlistItem place="Kyoto" country="Japão" progress={30} />
                <WishlistItem place="Patagônia" country="Argentina" progress={10} />
              </ul>
              <button className="w-full mt-6 py-2 text-sm text-[#394C97] font-semibold border border-[#394C97] rounded-lg hover:bg-[#394C97] hover:text-white transition-colors">
                + Adicionar Destino
              </button>
            </motion.div>

            {/* Banner Promocional Pequeno */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-[#FE5900] to-[#FF8C00] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-1">Missão Relâmpago!</h3>
                <p className="text-orange-100 text-sm mb-4">Visite 3 praias locais este mês e ganhe a badge "Rei dos Mares".</p>
                <button className="bg-white text-[#FE5900] text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-orange-50 transition">
                  Aceitar Desafio
                </button>
              </div>
              <Compass className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-20 rotate-45" />
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ===================================================================
// COMPONENTES AUXILIARES
// ===================================================================

const StatCard = ({ title, value, icon: Icon, delay, highlight }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28 hover:shadow-md transition-shadow relative overflow-hidden
      ${highlight ? "ring-2 ring-[#FE5900]/20" : ""}`}
  >
    <div className="flex justify-between items-start">
      <span className="text-xs font-semibold text-gray-500 uppercase">{title}</span>
      <Icon className={`w-5 h-5 ${highlight ? "text-[#FE5900]" : "text-[#394C97]"}`} />
    </div>
    <p className={`text-2xl font-bold mt-2 ${highlight ? "text-[#FE5900]" : "text-gray-800"}`}>
      {value}
    </p>
    {highlight && (
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FE5900]"></div>
    )}
  </motion.div>
);

const WishlistItem = ({ place, country, progress }) => (
  <li className="flex items-center gap-4">
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-bold text-gray-700">{place}</span>
        <span className="text-xs text-gray-500">{country}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div 
          className="bg-[#394C97] h-1.5 rounded-full transition-all duration-1000" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  </li>
);