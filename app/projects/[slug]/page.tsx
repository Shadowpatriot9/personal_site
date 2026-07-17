import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SubPage from '@/components/SubPage';
import { getOne } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

// Light markdown: "## " → heading, contiguous "- " lines → list, else paragraphs.
function renderBody(body: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      out.push(<p key={key++}>{para.join(' ')}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={key++}>
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (line.startsWith('## ')) {
      flushPara();
      flushList();
      out.push(
        <h3 key={key++} className="detail-heading">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith('- ')) {
      flushPara();
      list.push(line.slice(2));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out;
}

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
  const body = (project.body || '').trim();
  const tech = Array.isArray(project.technology) ? project.technology : [];
  const gallery = Array.isArray(project.gallery) ? project.gallery.filter(Boolean) : [];

  return (
    <SubPage slug={project.id} pageTitle={project.title} pageDescription={project.description}>
      <div className="grid-1">
        <section id="title">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </section>

        {project.image && (
          <figure className="detail-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.image} alt={`${project.title} cover`} />
          </figure>
        )}

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

          {body ? renderBody(body) : <p className="detail-muted">More details coming soon.</p>}

          {gallery.length > 0 && (
            <div className="detail-gallery">
              {gallery.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${src}-${i}`} src={src} alt={`${project.title} gallery image ${i + 1}`} loading="lazy" />
              ))}
            </div>
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
