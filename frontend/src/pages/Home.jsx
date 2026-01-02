import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Loader, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Importação necessária

import Navbar from "../components/Navbar";
import HomeCard from "../components/HomeCard";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";
// Importa o componente de detalhes para usar no modal
import MissionDetails from "../components/missions/MissionDetails"; 

import { fetchMissions } from "../api/apiFunctions";
import logoIcarir from "../assets/símbolo-icarir.png";

export default function Home() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null); // Estado para controlar o modal

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
    AOS.refresh();

    const scriptId = "elfsight-platform-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.id = scriptId;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const loadMissionsData = async () => {
      try {
        setLoading(true);
        const data = await fetchMissions();
        const activeMissions = Array.isArray(data) 
          ? data.filter(m => m.ativa !== false) 
          : [];
        setMissions(activeMissions);
      } catch (error) {
        console.error("Erro ao carregar missões da Home:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMissionsData();
  }, []);

  // Abre o modal com a missão selecionada
  const handleViewMission = (mission) => {
    setSelectedMission(mission);
  };

  // Fecha o modal
  const handleCloseModal = () => {
    setSelectedMission(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans relative">
      
      <Navbar />

      {/* --- SEÇÃO INSTAGRAM FEED --- */}
      <section className="relative bg-gradient-to-b from-[#002B5B] to-gray-50 dark:from-[#001a40] dark:to-[#3a3a3a] pt-20 pb-8 overflow-hidden min-h-[200px]">
        <div className="max-w-[1000px] mx-auto px-4 z-10 relative">
          <div className="elfsight-app-86adf4a7-150a-4b09-9aea-cb904cc41a4a">
            <p className="text-center text-white/50 text-sm py-10">Carregando Instagram...</p>
          </div>
        </div>
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url(${logoIcarir})`, backgroundSize: '300px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center right' }}></div>
      </section>

      {/* --- SEÇÃO DE DESTINOS --- */}
      <section className="relative max-w-[1800px] mx-auto py-16 px-6 z-20">
        <div className="bg-white/90 dark:bg-[#2f2f2f] backdrop-blur-md rounded-2xl p-8 shadow-xl dark:shadow-2xl mb-12 relative z-10 max-w-4xl mx-auto text-center border border-gray-100 dark:border-gray-700">
          <span className="text-[#FE5900] dark:text-[#394C97] font-bold uppercase tracking-widest text-sm">Expandir Horizontes</span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#394C97] dark:text-[#FE5900] mt-2">Destinos para Empreendedores</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            Descubra ecossistemas de inovação, feche negócios e participe de missões exclusivas nas cidades mais dinâmicas do nosso país.
          </p>
          <div className="w-24 h-1.5 bg-[#FE5900] dark:bg-[#394C97] mx-auto mt-6 rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-[#394C97] w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
            {missions.length > 0 ? (
              missions.map((mission) => (
                <HomeCard
                  key={mission.id}
                  city={mission.destino || mission.city || "Destino Global"} 
                  image={mission.foto_url || mission.imageUrl}
                  title={mission.titulo} 
                  onStartMission={() => handleViewMission(mission)} // Abre o Modal
                  loading={false}
                  animation="fade-up"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma missão disponível no momento.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- MODAL DE DETALHES (POPUP) --- */}
      <AnimatePresence>
        {selectedMission && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop Escuro */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Container do Modal */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
                {/* Botão Fechar */}
                <button 
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-sm"
                >
                    <X size={24} />
                </button>

                {/* Conteúdo com Scroll */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {/* Renderiza o componente de detalhes em modo ReadOnly */}
                    <MissionDetails 
                        mission={selectedMission} 
                        readOnly={true} 
                        onBack={handleCloseModal} // Fallback caso usem o botão voltar interno
                    />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FeedbackBar />
    </div>
  );
}