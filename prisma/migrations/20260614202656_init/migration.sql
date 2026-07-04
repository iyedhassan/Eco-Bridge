-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STARTUP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT,
    "description" TEXT,
    "offeredWasteTypes" JSONB NOT NULL DEFAULT [],
    "neededMaterialTypes" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "materialId" TEXT,
    "materialType" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "quantityKg" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "pricePerUnit" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'ACTIVE',
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "photos" JSONB NOT NULL DEFAULT [],
    "wasteReusedKg" REAL NOT NULL DEFAULT 0,
    "co2ReductionKg" REAL NOT NULL DEFAULT 0,
    "moneySavedTnd" REAL NOT NULL DEFAULT 0,
    "storageAvoidedKg" REAL NOT NULL DEFAULT 0,
    "sellerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "detectedMaterial" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "qualityLevel" TEXT NOT NULL DEFAULT '',
    "riskLevel" TEXT NOT NULL DEFAULT '',
    "valorizationScore" INTEGER NOT NULL DEFAULT 0,
    "estimatedPriceMin" REAL NOT NULL DEFAULT 0,
    "estimatedPriceMax" REAL NOT NULL DEFAULT 0,
    "co2SavedKg" REAL NOT NULL DEFAULT 0,
    "recommendationText" TEXT NOT NULL DEFAULT '',
    "materialType" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "possibleUses" JSONB NOT NULL DEFAULT [],
    "interestedSectors" JSONB NOT NULL DEFAULT [],
    "valorizationLevel" TEXT NOT NULL,
    "qualityRisk" TEXT NOT NULL,
    "estimatedPriceRange" TEXT NOT NULL,
    "suggestedTitle" TEXT NOT NULL,
    "improvedDescription" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "confidenceScore" INTEGER NOT NULL DEFAULT 80,
    "source" TEXT NOT NULL DEFAULT 'fallback',
    "co2ReductionKg" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIAnalysis_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "needs" JSONB NOT NULL DEFAULT [],
    "quantityKg" REAL NOT NULL DEFAULT 0,
    "maxPricePerUnit" REAL,
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "budgetLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialNeed_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "materialNeedId" TEXT,
    "buyerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "materialScore" INTEGER NOT NULL DEFAULT 0,
    "sectorScore" INTEGER NOT NULL DEFAULT 0,
    "locationScore" INTEGER NOT NULL DEFAULT 0,
    "quantityScore" INTEGER NOT NULL DEFAULT 0,
    "priceScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "scoreTotal" INTEGER NOT NULL,
    "badge" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "scorePayload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_materialNeedId_fkey" FOREIGN KEY ("materialNeedId") REFERENCES "MaterialNeed" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "quantityKg" REAL,
    "proposedPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Request_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Request_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Request_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "requestId" TEXT,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "listingId" TEXT,
    "body" TEXT NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amountTnd" REAL NOT NULL,
    "commissionTnd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_materialType_idx" ON "Listing"("materialType");

-- CreateIndex
CREATE INDEX "Listing_location_idx" ON "Listing"("location");

-- CreateIndex
CREATE INDEX "Listing_availability_idx" ON "Listing"("availability");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_listingId_key" ON "AIAnalysis"("listingId");

-- CreateIndex
CREATE INDEX "Match_buyerId_idx" ON "Match"("buyerId");

-- CreateIndex
CREATE INDEX "Match_listingId_idx" ON "Match"("listingId");

-- CreateIndex
CREATE INDEX "Request_buyerId_idx" ON "Request"("buyerId");

-- CreateIndex
CREATE INDEX "Request_sellerId_idx" ON "Request"("sellerId");

-- CreateIndex
CREATE INDEX "Request_listingId_idx" ON "Request"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_requestId_key" ON "Conversation"("requestId");

-- CreateIndex
CREATE INDEX "Conversation_buyerId_idx" ON "Conversation"("buyerId");

-- CreateIndex
CREATE INDEX "Conversation_sellerId_idx" ON "Conversation"("sellerId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_requestId_key" ON "Transaction"("requestId");

-- CreateIndex
CREATE INDEX "Transaction_buyerId_idx" ON "Transaction"("buyerId");

-- CreateIndex
CREATE INDEX "Transaction_sellerId_idx" ON "Transaction"("sellerId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
