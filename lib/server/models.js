import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    path: { type: String, required: true },
    component: { type: String, required: true },
    published: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const ProjectAuditSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectIdentifier: { type: String },
    action: { type: String, required: true },
    actor: { type: String, default: 'unknown' },
    summary: { type: String },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const ProjectAuditModel = mongoose.models.ProjectAudit || mongoose.model('ProjectAudit', ProjectAuditSchema);
