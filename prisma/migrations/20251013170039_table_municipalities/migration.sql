-- CreateTable
CREATE TABLE "ufs" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ufs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(7) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "uf_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ufs_code_key" ON "ufs"("code");

-- CreateIndex
CREATE INDEX "ufs_code_idx" ON "ufs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_code_key" ON "municipalities"("code");

-- CreateIndex
CREATE INDEX "municipalities_code_idx" ON "municipalities"("code");

-- CreateIndex
CREATE INDEX "municipalities_uf_id_idx" ON "municipalities"("uf_id");

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_uf_id_fkey" FOREIGN KEY ("uf_id") REFERENCES "ufs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
