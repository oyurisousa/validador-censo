/*
  Warnings:

  - The primary key for the `municipalities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `municipalities` table. All the data in the column will be lost.
  - You are about to drop the column `uf_id` on the `municipalities` table. All the data in the column will be lost.
  - The primary key for the `ufs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ufs` table. All the data in the column will be lost.
  - Added the required column `uf_code` to the `municipalities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."municipalities" DROP CONSTRAINT "municipalities_uf_id_fkey";

-- DropIndex
DROP INDEX "public"."municipalities_code_idx";

-- DropIndex
DROP INDEX "public"."municipalities_code_key";

-- DropIndex
DROP INDEX "public"."municipalities_uf_id_idx";

-- DropIndex
DROP INDEX "public"."ufs_code_idx";

-- DropIndex
DROP INDEX "public"."ufs_code_key";

-- AlterTable
ALTER TABLE "municipalities" DROP CONSTRAINT "municipalities_pkey",
DROP COLUMN "id",
DROP COLUMN "uf_id",
ADD COLUMN     "uf_code" VARCHAR(2) NOT NULL,
ADD CONSTRAINT "municipalities_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "ufs" DROP CONSTRAINT "ufs_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ufs_pkey" PRIMARY KEY ("code");

-- CreateIndex
CREATE INDEX "municipalities_uf_code_idx" ON "municipalities"("uf_code");

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_uf_code_fkey" FOREIGN KEY ("uf_code") REFERENCES "ufs"("code") ON DELETE CASCADE ON UPDATE CASCADE;
