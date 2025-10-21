import mongoose from 'mongoose';
import {
  PROJECT_STATUS_OPTIONS,
  PROJECT_ROUTE_PATTERN,
  DEFAULT_PROJECT_CATEGORY,
  DEFAULT_PROJECT_STATUS
} from '../../src/constants/projectMetadata.js';

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const createUniqueList = (values, { normaliseKey, transformValue }) => {
  const list = toArray(values);
  const seen = new Set();
  const result = [];

  list.forEach((item) => {
    if (typeof item !== 'string') {
      return;
    }
    const trimmed = item.trim();
    if (!trimmed) {
      return;
    }
    const key = normaliseKey(trimmed);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(transformValue(trimmed));
  });

  return result;
};

export const normalizeTechnology = (values) =>
  createUniqueList(values, {
    normaliseKey: (value) => value.toLowerCase(),
    transformValue: (value) => value
  });

export const normalizeTags = (values) =>
  createUniqueList(values, {
    normaliseKey: (value) => value.toLowerCase(),
    transformValue: (value) => value.toLowerCase()
  });

export const ensureIsoDateString = (value) => {
  if (!value) {
    return new Date().toISOString();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('dateCreated must be a valid date string');
  }
  return parsed.toISOString();
};

const trimToString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
};

export const sanitizeProjectPayload = (payload = {}, { applyDefaults = false } = {}) => {
  const sanitized = {};

  const assignString = (key, fallback) => {
    if (payload[key] !== undefined) {
      const trimmed = trimToString(payload[key]);
      if (trimmed !== '') {
        sanitized[key] = trimmed;
      } else if (trimmed === '' && !applyDefaults) {
        sanitized[key] = '';
      }
    } else if (applyDefaults && fallback !== undefined) {
      sanitized[key] = fallback;
    }
  };

  assignString('id');
  assignString('title');
  assignString('description');
  assignString('path');
  assignString('component');
  assignString('category', DEFAULT_PROJECT_CATEGORY);
  assignString('status', DEFAULT_PROJECT_STATUS);
  assignString('route');
  assignString('thumbnail', '');

  if (payload.tags !== undefined) {
    sanitized.tags = normalizeTags(payload.tags);
  } else if (applyDefaults) {
    sanitized.tags = [];
  }

  if (payload.technology !== undefined) {
    sanitized.technology = normalizeTechnology(payload.technology);
  } else if (applyDefaults) {
    sanitized.technology = [];
  }

  if (payload.dateCreated !== undefined) {
    sanitized.dateCreated = ensureIsoDateString(payload.dateCreated);
  } else if (applyDefaults) {
    sanitized.dateCreated = ensureIsoDateString();
  }

  // Ensure path defaults to route when not explicitly provided
  if ((sanitized.path === undefined || sanitized.path === '') && sanitized.route) {
    sanitized.path = sanitized.route;
  }

  return Object.fromEntries(
    Object.entries(sanitized).filter(([, value]) => value !== undefined)
  );
};

export const validateProjectPayload = (payload = {}, { requireAllFields = true } = {}) => {
  const errors = [];
  const requiredFields = ['id', 'title', 'description', 'path', 'component', 'category', 'status', 'route'];

  if (requireAllFields) {
    requiredFields.forEach((field) => {
      if (!payload[field]) {
        errors.push(`${field} is required`);
      }
    });
  } else {
    requiredFields.forEach((field) => {
      if (payload[field] !== undefined && !payload[field]) {
        errors.push(`${field} is required`);
      }
    });
  }

  if (payload.status !== undefined && !PROJECT_STATUS_OPTIONS.includes(payload.status)) {
    errors.push(`status must be one of: ${PROJECT_STATUS_OPTIONS.join(', ')}`);
  }

  if (payload.route !== undefined) {
    if (!payload.route) {
      errors.push('route is required');
    } else if (!PROJECT_ROUTE_PATTERN.test(payload.route)) {
      errors.push('route must start with "/" and contain only letters, numbers, slashes, underscores, or hyphens');
    }
  }

  if (payload.dateCreated !== undefined && Number.isNaN(Date.parse(payload.dateCreated))) {
    errors.push('dateCreated must be a valid ISO date string');
  }

  return errors;
};

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  path: { type: String, required: true, trim: true },
  component: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, default: DEFAULT_PROJECT_CATEGORY },
  status: { type: String, required: true, enum: PROJECT_STATUS_OPTIONS, default: DEFAULT_PROJECT_STATUS },
  technology: { type: [String], default: [], set: normalizeTechnology },
  tags: { type: [String], default: [], set: normalizeTags },
  dateCreated: {
    type: String,
    default: () => new Date().toISOString(),
    set: ensureIsoDateString,
    validate: {
      validator: (value) => !Number.isNaN(Date.parse(value)),
      message: 'dateCreated must be a valid ISO date string'
    }
  },
  route: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => PROJECT_ROUTE_PATTERN.test(value),
      message: 'Route must start with "/" and contain only letters, numbers, slashes, underscores, or hyphens'
    }
  },
  thumbnail: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProjectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProjectSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default ProjectModel;
