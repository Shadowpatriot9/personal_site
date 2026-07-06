import mongoose from 'mongoose';
import { PROJECT_STATUS_OPTIONS, PROJECT_ROUTE_PATTERN } from '@/lib/projects';

const DEFAULT_CATEGORY = 'Software';
const DEFAULT_STATUS = 'Active';

const stringListSetter = (value: unknown): string[] => {
  if (value === undefined || value === null) {
    return [];
  }
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list
    .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
    .filter((item) => item.length > 0);
};

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: DEFAULT_CATEGORY, trim: true },
    status: { type: String, default: DEFAULT_STATUS, trim: true },
    tags: { type: [String], default: [], set: stringListSetter },
    technology: { type: [String], default: [], set: stringListSetter },
    route: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) => !value || PROJECT_ROUTE_PATTERN.test(value),
        message: 'Route must start with "/" and contain only letters, numbers, slashes, underscores, or hyphens',
      },
    },
    path: { type: String, trim: true },
    component: { type: String, trim: true },
    dateCreated: { type: Date, default: Date.now },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

function applyRouteDefaults(doc: {
  route?: string;
  path?: string;
  id?: string;
}) {
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

ProjectSchema.pre('save', function preSave(next) {
  applyRouteDefaults(this as any);
  next();
});

ProjectSchema.pre('findOneAndUpdate', function preUpdate(next) {
  const update = this.getUpdate() as any;
  if (update) {
    applyRouteDefaults(update.$set || update);
  }
  next();
});

export const ProjectModel =
  mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export const PROJECT_STATUS = PROJECT_STATUS_OPTIONS;

export const sanitizeProjectDoc = (doc: any) => {
  const project = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const route =
    project.route || project.path || (project.id ? `/projects/${project.id}` : '#');

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    route,
    path: project.path || route,
    category: project.category || 'General',
    status: project.status || 'Unknown',
    technology: Array.isArray(project.technology) ? project.technology : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    dateCreated: project.dateCreated || project.createdAt || project.updatedAt,
    updatedAt: project.updatedAt,
    order: project.order ?? 0,
    published: project.published ?? true,
  };
};

export function normalizeProjectInput(input: Record<string, any> = {}) {
  const normalized: Record<string, any> = {};
  const stringFields = [
    'id',
    'title',
    'description',
    'status',
    'category',
    'route',
    'path',
    'component',
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

  if (input.tags !== undefined) {
    normalized.tags = stringListSetter(input.tags);
  }
  if (input.technology !== undefined) {
    normalized.technology = stringListSetter(input.technology);
  }

  if (Object.prototype.hasOwnProperty.call(input, 'dateCreated')) {
    if (input.dateCreated === null || input.dateCreated === '') {
      normalized.dateCreated = null;
    } else {
      const parsed = new Date(input.dateCreated);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid dateCreated value');
      }
      normalized.dateCreated = parsed;
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'published')) {
    normalized.published = Boolean(input.published);
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

export function buildProjectLookup(identifier?: string) {
  if (!identifier) {
    return null;
  }
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return { _id: identifier };
  }
  return { id: identifier };
}
