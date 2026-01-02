// Script de Diagnóstico de Quiz
// Execute com: node debug-quiz.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// COLOQUE O ID DA TAREFA AQUI PARA TESTAR
const TAREFA_ID_PARA_VERIFICAR = 1; 

async function verificarQuiz() {
  try {
    console.log(`\n🔍 Verificando Tarefa ID: ${TAREFA_ID_PARA_VERIFICAR}...\n`);

    const task = await prisma.tarefa.findUnique({
      where: { id: TAREFA_ID_PARA_VERIFICAR },
      include: {
        // Tenta buscar relacionamento com tabela Quiz (se existir)
        quiz: {
          include: {
            perguntas: true
          }
        },
        // Inclui categoria para conferência
        categoria: true
      }
    });

    if (!task) {
      console.log("❌ Tarefa não encontrada!");
      return;
    }

    console.log("=== 1. CAMPO 'REQUISITOS' (JSON String) ===");
    if (task.requisitos) {
      console.log("Conteúdo cru:", task.requisitos);
      try {
        const parsed = JSON.parse(task.requisitos);
        console.log("É um JSON válido?", "✅ Sim");
        console.log("Estrutura:", JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("É um JSON válido?", "❌ Não (Erro de parse)");
      }
    } else {
      console.log("⚠️ Campo 'requisitos' está VAZIO ou NULO.");
    }

    console.log("\n=== 2. RELACIONAMENTO 'QUIZ' (Tabela Separada) ===");
    if (task.quiz) {
      console.log("Quiz vinculado encontrado ID:", task.quiz.id);
      console.log("Ativo:", task.quiz.ativo);
      console.log("Perguntas vinculadas:", task.quiz.perguntas ? task.quiz.perguntas.length : 0);
      if (task.quiz.perguntas && task.quiz.perguntas.length > 0) {
        console.log(JSON.stringify(task.quiz.perguntas, null, 2));
      }
    } else {
      console.log("⚠️ Nenhum registro na tabela 'Quiz' vinculado a esta tarefa.");
    }

    console.log("\n=== 3. TIPO DA TAREFA ===");
    console.log("Tipo:", task.tipo);
    console.log("Categoria:", task.categoria?.nome);

  } catch (error) {
    console.error("Erro ao rodar diagnóstico:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarQuiz();