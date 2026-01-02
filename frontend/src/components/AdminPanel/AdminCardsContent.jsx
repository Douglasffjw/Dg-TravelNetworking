// frontend/src/components/AdminPanel/AdminCardsContent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Paper, useToast } from '@chakra-ui/react';
import { fetchCards, deleteCard } from '../../api/apiFunctions'; // Importe as funções de API
import CardModal from './CardModal'; // O Modal de Edição/Criação que faremos a seguir
import CardsTable from './CardsTable'; // Componente para exibir a tabela

const AdminCardsContent = () => {
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState(null); // Armazena o card para edição
    const toast = useToast();

    // Função para carregar os dados
    const loadCards = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchCards();
            setCards(data);
        } catch (error) {
            console.error("Erro ao carregar Cards:", error);
            toast({
                title: "Erro ao carregar Cards.",
                description: "Não foi possível buscar os dados da API.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadCards();
    }, [loadCards]);

    // Lida com a abertura do modal para criação
    const handleCreateClick = () => {
        setCardToEdit(null);
        setIsModalOpen(true);
    };

    // Lida com a abertura do modal para edição
    const handleEditClick = (card) => {
        setCardToEdit(card);
        setIsModalOpen(true);
    };

    // Lida com a exclusão (soft delete)
    const handleDeleteClick = async (cardId) => {
        if (window.confirm("Tem certeza que deseja desativar este Selo/Card?")) {
            try {
                await deleteCard(cardId);
                toast({
                    title: "Selo desativado.",
                    description: "O card foi desativado com sucesso.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                loadCards(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao desativar Card:", error);
                toast({
                    title: "Erro na desativação.",
                    description: "Não foi possível desativar o card.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };
    
    // Chamado após criar ou editar um card com sucesso
    const handleModalSuccess = () => {
        setIsModalOpen(false);
        loadCards(); // Recarrega os dados para mostrar a atualização
    };

    return (
        <Box p={5}>
            <Typography variant="h2" mb={4}>
                Gerenciamento de Selos (Cards)
            </Typography>
            
            <Paper elevation={3} p={4} mb={6}>
                <Button colorScheme="green" onClick={handleCreateClick}>
                    + Criar Novo Selo
                </Button>
            </Paper>

            {/* Aqui você usará a tabela de cards */}
            {isLoading ? (
                <Typography>Carregando cards...</Typography>
            ) : (
                <CardsTable 
                    cards={cards} 
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick} 
                />
            )}

            {/* Modal de Criação/Edição */}
            <CardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cardData={cardToEdit}
                onSuccess={handleModalSuccess}
            />
        </Box>
    );
};

export default AdminCardsContent;