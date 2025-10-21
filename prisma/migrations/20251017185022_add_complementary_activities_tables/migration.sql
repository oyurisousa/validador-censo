-- CreateTable
CREATE TABLE "areas" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "sub_areas" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area_code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_areas_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "complementary_activities" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area_code" VARCHAR(10) NOT NULL,
    "sub_area_code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complementary_activities_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "sub_areas_area_code_idx" ON "sub_areas"("area_code");

-- CreateIndex
CREATE INDEX "complementary_activities_area_code_idx" ON "complementary_activities"("area_code");

-- CreateIndex
CREATE INDEX "complementary_activities_sub_area_code_idx" ON "complementary_activities"("sub_area_code");

-- AddForeignKey
ALTER TABLE "sub_areas" ADD CONSTRAINT "sub_areas_area_code_fkey" FOREIGN KEY ("area_code") REFERENCES "areas"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complementary_activities" ADD CONSTRAINT "complementary_activities_area_code_fkey" FOREIGN KEY ("area_code") REFERENCES "areas"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complementary_activities" ADD CONSTRAINT "complementary_activities_sub_area_code_fkey" FOREIGN KEY ("sub_area_code") REFERENCES "sub_areas"("code") ON DELETE CASCADE ON UPDATE CASCADE;
