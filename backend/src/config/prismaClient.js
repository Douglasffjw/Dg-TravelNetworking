const { PrismaClient } = require('@prisma/client');

// Instancia o cliente do Prisma
const prisma = new PrismaClient();

module.exports = prisma;