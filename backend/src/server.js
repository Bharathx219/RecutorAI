import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || "recruitorai";

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI in backend/.env");
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ALLOWED_COLLECTIONS = new Set(["jobs", "applications", "interviewquestions"]);
const flexibleSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
  },
  { strict: false, versionKey: false }
);
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    _createdDate: { type: String, required: true },
    _updatedDate: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ["candidate", "recruiter"] },
    passwordHash: { type: String, required: true },
  },
  { versionKey: false }
);
userSchema.index({ email: 1, role: 1 }, { unique: true });
const UserModel = mongoose.models.users || mongoose.model("users", userSchema, "users");

function getModel(collectionName) {
  if (!ALLOWED_COLLECTIONS.has(collectionName)) {
    throw new Error(`Collection '${collectionName}' is not allowed`);
  }
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  return mongoose.model(collectionName, flexibleSchema, collectionName);
}

function getUserFromHeaders(req) {
  return {
    userId: req.header("x-user-id") || "",
    role: req.header("x-user-role") || "",
    name: req.header("x-user-name") || "",
    email: req.header("x-user-email") || "",
  };
}

function getOwnershipFilter(collectionName, user) {
  if (!user.userId || !user.role) return {};

  if (collectionName === "jobs") {
    return user.role === "recruiter" ? { recruiterId: user.userId } : {};
  }
  if (collectionName === "applications") {
    if (user.role === "recruiter") return { recruiterId: user.userId };
    if (user.role === "candidate") return { candidateId: user.userId };
  }
  if (collectionName === "interviewquestions") {
    if (user.role === "recruiter") return { recruiterId: user.userId };
    if (user.role === "candidate") return { candidateId: user.userId };
  }
  return {};
}

function applyOwnershipOnCreate(collectionName, itemData, user) {
  const next = { ...itemData };

  if (collectionName === "jobs" && user.role === "recruiter" && user.userId) {
    next.recruiterId = user.userId;
  }

  if (collectionName === "applications") {
    if (user.role === "candidate" && user.userId) {
      next.candidateId = user.userId;
      if (!next.candidateName && user.name) next.candidateName = user.name;
    }
  }

  if (collectionName === "interviewquestions" && user.role === "recruiter" && user.userId) {
    next.recruiterId = user.userId;
  }

  return next;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;
  const computed = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  if (computed.length !== original.length) return false;
  return timingSafeEqual(computed, original);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "RecruitorAI backend is running" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const role = req.body?.role;
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const name = String(req.body?.name || "").trim();

    if (!["candidate", "recruiter"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existing = await UserModel.findOne({ email, role }).lean();
    if (existing) {
      return res.status(409).json({ error: "User already exists for this role" });
    }

    const now = new Date().toISOString();
    const user = await UserModel.create({
      _id: randomUUID(),
      _createdDate: now,
      _updatedDate: now,
      name,
      email,
      role,
      passwordHash: hashPassword(password),
    });

    return res.status(201).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to register user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const role = req.body?.role;
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!["candidate", "recruiter"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email, role }).lean();
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to login" });
  }
});

app.post("/api/data/:collection", async (req, res) => {
  try {
    const collection = req.params.collection;
    const Model = getModel(collection);
    const user = getUserFromHeaders(req);
    const rawItem = req.body?.itemData || {};
    const multiReferences = req.body?.multiReferences || {};

    const base = applyOwnershipOnCreate(collection, rawItem, user);
    const now = new Date().toISOString();
    const payload = {
      ...base,
      ...multiReferences,
      _id: base._id || randomUUID(),
      _createdDate: base._createdDate || now,
      _updatedDate: now,
    };

    const created = await Model.create(payload);
    res.status(201).json(created.toObject());
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create item" });
  }
});

app.get("/api/data/:collection", async (req, res) => {
  try {
    const collection = req.params.collection;
    const Model = getModel(collection);
    const user = getUserFromHeaders(req);
    const ownershipFilter = getOwnershipFilter(collection, user);
    const limit = Math.max(1, Math.min(1000, Number(req.query.limit || 50)));
    const skip = Math.max(0, Number(req.query.skip || 0));

    const [items, totalCount] = await Promise.all([
      Model.find(ownershipFilter).sort({ _createdDate: -1 }).skip(skip).limit(limit).lean(),
      Model.countDocuments(ownershipFilter),
    ]);

    const hasNext = skip + items.length < totalCount;
    res.json({
      items,
      totalCount,
      hasNext,
      currentPage: Math.floor(skip / limit),
      pageSize: limit,
      nextSkip: hasNext ? skip + limit : null,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to fetch items" });
  }
});

app.get("/api/data/:collection/:id", async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;
    const Model = getModel(collection);
    const user = getUserFromHeaders(req);
    const ownershipFilter = getOwnershipFilter(collection, user);

    const item = await Model.findOne({ _id: id, ...ownershipFilter }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to fetch item" });
  }
});

app.put("/api/data/:collection/:id", async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;
    const Model = getModel(collection);
    const user = getUserFromHeaders(req);
    const ownershipFilter = getOwnershipFilter(collection, user);
    const incoming = req.body?.itemData || {};

    const updated = await Model.findOneAndUpdate(
      { _id: id, ...ownershipFilter },
      {
        $set: {
          ...incoming,
          _id: id,
          _updatedDate: new Date().toISOString(),
        },
      },
      { new: true, lean: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to update item" });
  }
});

app.delete("/api/data/:collection/:id", async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;
    const Model = getModel(collection);
    const user = getUserFromHeaders(req);
    const ownershipFilter = getOwnershipFilter(collection, user);

    const removed = await Model.findOneAndDelete({ _id: id, ...ownershipFilter }).lean();
    if (!removed) return res.status(404).json({ error: "Not found" });
    return res.json(removed);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to delete item" });
  }
});

async function start() {
  await mongoose.connect(mongoUri, { dbName: mongoDbName });
  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start backend", err);
  process.exit(1);
});
