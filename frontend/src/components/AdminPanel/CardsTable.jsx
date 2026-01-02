import React from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    Badge,
    Flex,
    Text
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

const CardsTable = ({ cards, onEdit, onDelete }) => {
    if (!cards || cards.length === 0) {
        return (
            <Text p={4} color="gray.500">
                Nenhum Selo (Card) encontrado. Clique em "Criar Novo Selo" para começar.
            </Text>
        );
    }

    return (
        <TableContainer as="div">
            <Table variant="simple" size="md">
                <Thead>
                    <Tr bg="gray.100">
                        <Th>ID</Th>
                        <Th>Título</Th>
                        <Th>Tarefa Associada</Th>
                        <Th>Status</Th>
                        <Th>Data Criação</Th>
                        <Th isNumeric>Ações</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {cards.map((card) => (
                        <Tr key={card.id} _hover={{ bg: 'gray.50' }}>
                            <Td fontWeight="bold">{card.id}</Td>
                            <Td>{card.titulo}</Td>
                            {/* Assumimos que o campo 'tarefa' com o título vem do include no backend */}
                            <Td>
                                {card.tarefa 
                                    ? <Text>{card.tarefa.titulo}</Text>
                                    : <Text color="red.500">Tarefa não encontrada ({card.tarefa_id})</Text>
                                }
                            </Td>
                            <Td>
                                <Badge colorScheme={card.ativo ? 'green' : 'red'}>
                                    {card.ativo ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </Td>
                            <Td>
                                {new Date(card.data_criacao).toLocaleDateString('pt-BR')}
                            </Td>
                            <Td isNumeric>
                                <Flex justify="flex-end" gap={2}>
                                    <Button 
                                        size="sm" 
                                        colorScheme="blue" 
                                        onClick={() => onEdit(card)}
                                        leftIcon={<EditIcon />}
                                    >
                                        Editar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        colorScheme="red" 
                                        variant="outline"
                                        onClick={() => onDelete(card.id)}
                                        leftIcon={<DeleteIcon />}
                                    >
                                        Desativar
                                    </Button>
                                </Flex>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default CardsTable;