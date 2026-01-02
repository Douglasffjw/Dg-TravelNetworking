import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Checkbox,
    useToast,
    Box,
    Spinner
} from '@chakra-ui/react';
import { createCard, updateCard, fetchTasksForSelect } from '../../api/apiFunctions';

const CardModal = ({ isOpen, onClose, cardData, onSuccess }) => {
    const isEditing = !!cardData;
    const toast = useToast();

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        tarefa_id: '',
        ativo: true,
    });
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efeito para carregar a lista de tarefas
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const taskList = await fetchTasksForSelect();
                setTasks(taskList);
            } catch (error) {
                console.error("Erro ao carregar lista de Tarefas:", error);
                toast({
                    title: "Erro de dependência.",
                    description: "Não foi possível carregar a lista de Tarefas (para o 'tarefa_id').",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingTasks(false);
            }
        };
        loadTasks();
    }, [toast]);

    // Efeito para preencher o formulário quando em modo de edição
    useEffect(() => {
        if (isEditing && cardData) {
            setFormData({
                titulo: cardData.titulo || '',
                descricao: cardData.descricao || '',
                // Garante que o ID da tarefa é tratado como string no Select
                tarefa_id: String(cardData.tarefa_id) || '', 
                ativo: cardData.ativo || false,
            });
        } else {
            // Limpa o formulário ao abrir para criação
            setFormData({ titulo: '', descricao: '', tarefa_id: '', ativo: true });
        }
    }, [isEditing, cardData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.titulo || !formData.tarefa_id) {
            toast({
                title: "Campos obrigatórios.",
                description: "Título e Tarefa associada são necessários.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                // Garante que tarefa_id é um número antes de enviar
                tarefa_id: parseInt(formData.tarefa_id, 10), 
            };

            if (isEditing) {
                await updateCard(cardData.id, dataToSubmit);
            } else {
                await createCard(dataToSubmit);
            }

            toast({
                title: isEditing ? "Selo atualizado!" : "Selo criado!",
                description: `O Card "${formData.titulo}" foi salvo com sucesso.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onSuccess(); // Chama a função de sucesso para fechar o modal e recarregar a lista
        } catch (error) {
            console.error("Erro ao salvar Card:", error);
            const errorMessage = error.response?.data?.error || "Erro ao salvar o Selo (Card).";
            toast({
                title: "Falha na requisição.",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{isEditing ? `Editar Selo: ${cardData.titulo}` : 'Criar Novo Selo (Card)'}</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody pb={6}>

                        {/* Campo Título */}
                        <FormControl isRequired mb={4}>
                            <FormLabel>Título do Selo</FormLabel>
                            <Input
                                name="titulo"
                                placeholder="Ex: Aventureiro Nível 1"
                                value={formData.titulo}
                                onChange={handleChange}
                            />
                        </FormControl>

                        {/* Campo Tarefa Associada */}
                        <FormControl isRequired mb={4}>
                            <FormLabel>Tarefa Associada (ID: {formData.tarefa_id})</FormLabel>
                            <Select
                                name="tarefa_id"
                                placeholder={isLoadingTasks ? "Carregando tarefas..." : "Selecione uma Tarefa"}
                                value={formData.tarefa_id}
                                onChange={handleChange}
                                disabled={isLoadingTasks || isSubmitting}
                            >
                                {tasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.titulo}
                                    </option>
                                ))}
                            </Select>
                            {isLoadingTasks && <Box mt={2}><Spinner size="sm" /> Carregando lista...</Box>}
                        </FormControl>
                        
                        {/* Campo Descrição */}
                        <FormControl mb={4}>
                            <FormLabel>Descrição (Opcional)</FormLabel>
                            <Textarea
                                name="descricao"
                                placeholder="Breve descrição sobre o que o card representa."
                                value={formData.descricao}
                                onChange={handleChange}
                            />
                        </FormControl>

                        {/* Checkbox Ativo */}
                        <FormControl mb={4}>
                            <Checkbox
                                name="ativo"
                                isChecked={formData.ativo}
                                onChange={handleChange}
                            >
                                Selo Ativo
                            </Checkbox>
                        </FormControl>
                        
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={onClose} mr={3} variant="ghost" isDisabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="green" 
                            type="submit" 
                            isLoading={isSubmitting} 
                            loadingText={isEditing ? 'Salvando...' : 'Criando...'}
                        >
                            {isEditing ? 'Salvar Alterações' : 'Criar Selo'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default CardModal;