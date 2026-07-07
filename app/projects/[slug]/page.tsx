import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getOne } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getOne(slug);
  if (!project) {
    return { title: 'Project not found' };
  }
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getOne(slug);

  if (!project || project.published === false || project.isArchived) {
    notFound();
  }

  const date = project.dateCreated
    ? new Date(project.dateCreated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const meta = [project.status, project.category, date].filter(Boolean) as string[];
  const paragraphs = (project.body || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const tech = Array.isArray(project.technology) ? project.technology : [];

  return (
    <SubPage slug={project.id} pageTitle={project.title} pageDescription={project.description}>
      <div className="grid-1">
        <section id="title">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </section>

        <section className="section" id="brief">
          {meta.length > 0 && (
            <p className="detail-meta">
              {meta.map((m, i) => (
                <span key={m}>
                  {i > 0 && <span className="detail-dot">·</span>}
                  {m}
                </span>
              ))}
            </p>
          )}

          {tech.length > 0 && (
            <div className="detail-tags">
              {tech.map((t) => (
                <span key={t} className="detail-tag">
                  {t}
                </span>
              ))}
            </div>
          )}

          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="detail-muted">More details coming soon.</p>
          )}

          {project.link && (
            <a
              className="detail-link"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit project ↗
            </a>
          )}
        </section>
      </div>
    </SubPage>
  );
}
