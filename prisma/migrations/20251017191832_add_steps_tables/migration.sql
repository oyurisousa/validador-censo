-- CreateTable
CREATE TABLE "aggregated_steps" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aggregated_steps_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "steps" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "aggregated_step_code" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "steps_aggregated_step_code_idx" ON "steps"("aggregated_step_code");

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_aggregated_step_code_fkey" FOREIGN KEY ("aggregated_step_code") REFERENCES "aggregated_steps"("code") ON DELETE CASCADE ON UPDATE CASCADE;
