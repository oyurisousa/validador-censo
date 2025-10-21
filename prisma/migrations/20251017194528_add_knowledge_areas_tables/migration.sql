-- CreateTable
CREATE TABLE "knowledge_area_categories" (
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_area_categories_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "knowledge_areas" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_code" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_areas_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "knowledge_areas_category_code_idx" ON "knowledge_areas"("category_code");

-- AddForeignKey
ALTER TABLE "knowledge_areas" ADD CONSTRAINT "knowledge_areas_category_code_fkey" FOREIGN KEY ("category_code") REFERENCES "knowledge_area_categories"("code") ON DELETE CASCADE ON UPDATE CASCADE;
