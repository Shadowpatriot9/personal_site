import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const { MONGO_URI } = process.env;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

let cached = global.mongooseConnection;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongooseConnection = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
    }).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const stringListSetter = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const list = Array.isArray(value) ? value : String(value).split(',');
  return list
    .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
    .filter((item) => item.length > 0);
};

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  summary: { type: String, trim: true },
  status: { type: String, default: 'Draft', trim: true },
  category: { type: String, default: 'General', trim: true },
  tags: {
    type: [String],
    default: [],
    set: (value) => {
      const parsed = stringListSetter(value);
      return parsed ?? [];
    },
  },
  technology: {
    type: [String],
    default: [],
    set: (value) => {
      const parsed = stringListSetter(value);
      return parsed ?? [];
    },
  },
  route: { type: String, trim: true },
  path: { type: String, trim: true },
  component: { type: String, trim: true },
  heroImage: { type: String, trim: true },
  heroImageAlt: { type: String, trim: true },
  dateCreated: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

function applyRouteDefaults(doc) {
  if (!doc.route && doc.path) {
    doc.route = doc.path;
  }
  if (!doc.route && doc.id) {
    doc.route = `/projects/${doc.id}`;
  }
  if (!doc.path && doc.route) {
    doc.path = doc.route;
  }
}

ProjectSchema.pre('save', function projectPreSave(next) {
  applyRouteDefaults(this);
  next();
});

ProjectSchema.pre('findOneAndUpdate', function projectPreUpdate(next) {
  const update = this.getUpdate();
  if (update) {
    const target = update.$set || update;
    if (target) {
      applyRouteDefaults(target);
    }
  }
  next();
});

export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export function ensureAuthenticated(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({ error: 'No token provided' });
    return false;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Invalid authorization header' });
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return true;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}

function parseStringList(value) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return [];
  }

  const list = Array.isArray(value) ? value : String(value).split(',');
  return list
    .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
    .filter((item) => item.length > 0);
}

export function normalizeProjectInput(input = {}) {
  const normalized = {};
  const stringFields = [
    'id',
    'title',
    'description',
    'summary',
    'status',
    'category',
    'route',
    'path',
    'component',
    'heroImage',
    'heroImageAlt',
  ];

  stringFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      const value = input[field];
      if (value === null) {
        normalized[field] = null;
      } else if (typeof value === 'string') {
        normalized[field] = value.trim();
      } else if (value !== undefined) {
        normalized[field] = String(value);
      }
    }
  });

  const tags = parseStringList(input.tags);
  if (tags !== undefined) {
    normalized.tags = tags;
  }

  const technology = parseStringList(input.technology);
  if (technology !== undefined) {
    normalized.technology = technology;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'dateCreated')) {
    if (input.dateCreated === null || input.dateCreated === '') {
      normalized.dateCreated = null;
    } else {
      const parsedDate = new Date(input.dateCreated);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error('Invalid dateCreated value');
      }
      normalized.dateCreated = parsedDate;
    }
  }

  if (!normalized.route && normalized.path) {
    normalized.route = normalized.path;
  }
  if (!normalized.path && normalized.route) {
    normalized.path = normalized.route;
  }
  if (!normalized.route && normalized.id) {
    normalized.route = `/projects/${normalized.id}`;
    if (!normalized.path) {
      normalized.path = normalized.route;
    }
  }

  return normalized;
}

export function buildProjectLookup(identifier) {
  if (!identifier) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return { _id: identifier };
  }

  return { id: identifier };
}

export function buildBulkDeleteQuery(identifiers = []) {
  if (!Array.isArray(identifiers)) {
    return null;
  }

  const objectIds = new Set();
  const slugs = new Set();

  identifiers.forEach((value) => {
    if (value === undefined || value === null) {
      return;
    }
    const stringValue = typeof value === 'string' ? value.trim() : String(value).trim();
    if (!stringValue) {
      return;
    }

    if (mongoose.Types.ObjectId.isValid(stringValue)) {
      objectIds.add(stringValue);
    } else {
      slugs.add(stringValue);
    }
  });

  const conditions = [];
  if (objectIds.size > 0) {
    conditions.push({ _id: { $in: Array.from(objectIds) } });
  }
  if (slugs.size > 0) {
    conditions.push({ id: { $in: Array.from(slugs) } });
  }

  if (conditions.length === 0) {
    return null;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $or: conditions };
}
