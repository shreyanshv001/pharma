/*
  Warnings:

  - You are about to drop the column `applications` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `components` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Instrument` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Instrument" DROP COLUMN "applications",
DROP COLUMN "components",
DROP COLUMN "imageUrl",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrls" TEXT[];
