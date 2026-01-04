import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Componente MissaoDetalhes
const MissaoDetalhes = () => {
    const navigate = useNavigate();
    // Pega o ID da URL, se existir (ex: /missao/123)
    const { id } = useParams(); 
    
    // Estados para carregar os dados e gerenciar a UI
    const [missionData, setMissionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Começa como true
    const [isAccepting, setIsAccepting] = useState(false);

    // Função Simulada para buscar dados (SUBSTITUIR PELA SUA CHAMADA DE API)
    const fetchMissionData = async (missionId) => {
        // --- INÍCIO DA SIMULAÇÃO ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula atraso da API

        // Simulação de um objeto de dados real:
        const simulatedData = {
            id: missionId,
            titulo: `Campanha Alpha - Missão ${missionId}`,
            cidade: "São Paulo",
            pontos: 1500,
            data: "15 de Dezembro, 2025",
            descricao: "Esta missão envolve a coleta de dados ambientais em três pontos distintos da cidade e a resolução de um quiz sobre sustentabilidade. Ela é crucial para o nosso projeto trimestral de impacto social e deve ser concluída em 7 dias. Não perca tempo, comece agora e garanta sua recompensa máxima!",
            imagem: `https://picsum.photos/seed/${missionId}/1200/800`, // Imagem baseada no ID
            galeria: [
                `https://picsum.photos/seed/${missionId}a/300/300`,
                `https://picsum.photos/seed/${missionId}b/300/300`,
                `https://picsum.photos/seed/${missionId}c/300/300`,
                `https://picsum.photos/seed/${missionId}d/300/300`,
            ],
        };
        // --- FIM DA SIMULAÇÃO ---

        return simulatedData;
    };

    // 🌐 Efeito para carregar os dados quando o componente montar ou o ID mudar
    useEffect(() => {
        if (id) {
            // Se o ID existe, inicia o carregamento dos dados
            setIsLoading(true);
            fetchMissionData(id)
                .then(data => {
                    setMissionData(data);
                })
                .catch(error => {
                    console.error("Erro ao carregar missão:", error);
                    setMissionData(null); // Define como nulo em caso de falha
                })
                .finally(() => {
                    setIsLoading(false); // ✅ FINALIZA O CARREGAMENTO, INDEPENDENTE DO SUCESSO
                });
        } else {
            // ✅ SE NÃO HOUVER ID, FINALIZA O CARREGAMENTO IMEDIATAMENTE
            // Isso aciona o bloco de UI "Missão Não Encontrada"
            setIsLoading(false);
            setMissionData(null); 
        }
    }, [id]); // Dependência no 'id' para recarregar se a rota mudar

    // Função para lidar com o início da missão
    const handleStartMission = async () => {
        if (isAccepting) return;
        setIsAccepting(true);

        console.log(`Você aceitou a missão ${missionData.titulo} em ${missionData.cidade}`);
        
        // Simula o processo de aceitação/API call de 1.5s
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        setIsAccepting(false);
        // Navega para a área de missões após "aceitar"
        navigate("/missions"); 
    };

    // 🔄 UI de Carregamento
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <p className="text-xl text-blue-600">Carregando detalhes da missão...</p>
            </div>
        );
    }

    // 🚫 UI de Missão Não Encontrada ou Erro
    if (!missionData || !id) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Missão não encontrada</h2>
                <p className="text-gray-500 mb-6">A missão com ID "{id || 'desconhecido'}" pode não existir ou a URL está incorreta.</p>
                <button
                    onClick={() => navigate('/missions')} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                    Ver Todas as Missões
                </button>
            </div>
        );
    }

    // Obtém as imagens da galeria.
    const galleryImages = missionData?.galeria || [];

    // 🎯 UI Principal
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-xl border border-gray-100 font-sans text-gray-800">
            
                {/* Breadcrumb */}
                <div className="flex items-center text-xs font-bold text-gray-400 mb-6 uppercase tracking-wide">
                    <span onClick={() => navigate('/')} className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
                    <span className="mx-2 text-gray-300">&gt;</span>
                    <span onClick={() => navigate('/missions')} className="hover:text-blue-600 cursor-pointer transition-colors">Missões</span>
                    <span className="mx-2 text-gray-300">&gt;</span>
                    <span className="text-blue-800">Detalhes</span>
                </div>

                {/* Título DINÂMICO */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                    {missionData.titulo} ({missionData.cidade})
                </h1>
                <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full mb-6">
                    Recompensa: {missionData.pontos} XP
                </span>

                {/* Hero Image */}
                <div
                    className="w-full h-72 md:h-96 bg-gray-200 rounded-xl mb-8 bg-cover bg-center shadow-lg"
                    style={{ 
                        backgroundImage: `url('${missionData.imagem}')`,
                        boxShadow: '0 10px 20px -5px rgba(57, 76, 151, 0.4)'
                    }}
                ></div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 mb-10 border-b border-gray-100 pb-6">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                        className="w-12 h-12 rounded-full bg-gray-100 object-cover border-4 border-gray-200"
                        alt="Avatar"
                    />
                    <div>
                        <h4 className="text-base font-bold text-gray-900 leading-none">Equipe de Operações Icarir</h4>
                        <p className="text-sm text-gray-500 mt-1">{missionData.data}</p>
                    </div>
                </div>

                {/* Card de Ação (CTA) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-12 shadow-inner">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 min-w-[48px] bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wider mb-1">Inicie sua Jornada</h3>
                            <p className="text-sm text-gray-600 leading-snug">O relógio começa a correr assim que você aceita a missão.</p>
                        </div>
                    </div>

                    {/* Botão Principal: Agora usa o handleStartMission e o estado isAccepting */}
                    <button
                        onClick={handleStartMission}
                        disabled={isAccepting}
                        className={`w-full md:w-auto font-semibold py-3 px-8 rounded-full text-md transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group
                            ${isAccepting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#394C97] hover:bg-[#986dff] text-white'
                            }`}
                    >
                        {isAccepting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Iniciando...
                            </span>
                        ) : (
                            <>
                                <span>Aceitar Missão</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Texto Descritivo DINÂMICO */}
                <div className="text-gray-600 text-lg leading-relaxed space-y-6 mb-12">
                    <p>
                        {missionData.descricao}
                    </p>
                    <p>
                        Esta missão ocupa um papel central na nossa estratégia trimestral e reúne uma série de desafios práticos em <strong className="text-gray-900">{missionData.cidade}</strong>, quiz de conhecimento e tarefas de engajamento social.
                    </p>
                    <p>
                        Descubra o prazer de superar seus limites. Ao concluir todas as etapas, você acumula <strong className="text-gray-900">{missionData.pontos} pontos</strong> valiosos.
                    </p>
                </div>

                {/* SEÇÃO DE GALERIA */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b pb-2">Ambiente da Missão</h2>
                    <p className="text-md text-gray-500 mb-6 max-w-2xl">
                        Uma prévia dos locais e desafios que você encontrará em <strong className="text-gray-900">{missionData.cidade}</strong>.
                    </p>

                    {/* AQUI ESTÁ A GALERIA */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {galleryImages.map((src, index) => (
                            <div key={index} className="overflow-hidden rounded-xl h-32 bg-gray-200 shadow-md">
                                <img
                                    src={src}
                                    alt={`Galeria de ${missionData.cidade} - ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>

                    <ul className="space-y-3 text-base text-gray-600 border-t pt-6">
                        <li className="flex items-start"><span className="mr-3 font-bold text-blue-400">→</span><span><strong className="text-gray-900">Recompensa Máxima:</strong> {missionData.pontos} Pontos de experiência e medalha de ouro.</span></li>
                        <li className="flex items-start"><span className="mr-3 font-bold text-blue-400">→</span><span><strong className="text-gray-900">Prazo de Conclusão:</strong> 7 dias após o início.</span></li>
                        <li className="flex items-start"><span className="mr-3 font-bold text-blue-400">→</span><span><strong className="text-gray-900">Requisito Básico:</strong> Onboarding completo e Nível 5 de conta.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MissaoDetalhes;