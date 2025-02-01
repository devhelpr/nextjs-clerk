/*
  Warnings:

  - Made the column `name` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/

CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
