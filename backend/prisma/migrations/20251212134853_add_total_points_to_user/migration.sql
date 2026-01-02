-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_tarefa_id_fkey";

-- AlterTable
ALTER TABLE "tarefas" ADD COLUMN     "quizId" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "pontos_totais" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
