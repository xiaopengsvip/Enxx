-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "antonyms" JSONB,
ADD COLUMN     "definitionEn" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "forms" JSONB,
ADD COLUMN     "frequency" INTEGER,
ADD COLUMN     "phrases" JSONB,
ADD COLUMN     "synonyms" JSONB,
ADD COLUMN     "usageNotes" TEXT;
