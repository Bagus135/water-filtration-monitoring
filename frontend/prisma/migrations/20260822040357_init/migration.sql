-- CreateTable
CREATE TABLE "SensorReading" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "phBefore" DOUBLE PRECISION NOT NULL,
    "tdsBefore" DOUBLE PRECISION NOT NULL,
    "turbidityBefore" DOUBLE PRECISION NOT NULL,
    "phAfter" DOUBLE PRECISION NOT NULL,
    "tdsAfter" DOUBLE PRECISION NOT NULL,
    "turbidityAfter" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SensorReading_timestamp_idx" ON "SensorReading"("timestamp");
