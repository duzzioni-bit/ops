-- CreateTable
CREATE TABLE "recibos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "pagadorNome" TEXT NOT NULL,
    "pagadorCpf" TEXT,
    "pagadorRg" TEXT,
    "recebedorNome" TEXT NOT NULL,
    "recebedorCpf" TEXT,
    "recebedorRg" TEXT,
    "referente" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "recibos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "recibos_numero_userId_key" ON "recibos"("numero", "userId");
