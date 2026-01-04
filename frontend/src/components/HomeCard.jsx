import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

export default function HomeCard({
  city,
  image,
  onStartMission, // Na Home, esta função apenas redireciona para os detalhes
  title,
  animation = "fade-up",
  aosDelay = 0,
}) {
  return (
    <div
      data-aos={animation}
      data-aos-delay={aosDelay}
      onClick={onStartMission}
      className="group relative cursor-pointer bg-white dark:bg-[#2f2f2f] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-700"
    >
      {/* Container da Imagem */}
      <div className="h-48 w-full overflow-hidden relative">
        {image ? (
           <img
            src={image}
            alt={city}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        ) : (
           <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
             <MapPin size={32} />
           </div>
        )}
       
        {/* Gradiente Overlay para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

        {/* Badge de Localização sobre a imagem */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-bold bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-sm">
            <MapPin size={12} className="text-[#986dff]" /> {city}
        </div>
      </div>

      {/* Conteúdo Informativo */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-[#986dff] dark:group-hover:text-[#986dff] transition-colors">
          {title || city}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
          Explore os detalhes desta oportunidade e prepare-se para expandir seus horizontes.
        </p>

        {/* Call to Action passivo (Link) */}
        <div className="mt-auto flex items-center text-sm font-bold text-[#986dff] dark:text-[#986dff] group-hover:underline">
          Ver detalhes <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}