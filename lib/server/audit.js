import { ProjectAuditModel } from './models.js';

export async function logProjectMutation({
  projectId,
  projectIdentifier,
  action,
  actor = 'unknown',
  before,
  after,
  summary,
  metadata,
}) {
  try {
    await ProjectAuditModel.create({
      projectId,
      projectIdentifier,
      action,
      actor,
      before,
      after,
      summary,
      metadata,
    });
  } catch (error) {
    console.error('[audit] Failed to record project mutation', {
      action,
      projectIdentifier,
      error: error.message,
    });
  }
}
