/**
 * Editable site content: the homepage introduction and contact links.
 * Client-safe types and defaults; the defaults mirror the original
 * hardcoded copy and are what the site shows until something is saved.
 */

export interface ContactLink {
  label: string;
  href: string;
}

export interface SiteContent {
  name: string;
  tagline: string;
  note: string;
  contactLinks: ContactLink[];
}

export const defaultSiteContent: SiteContent = {
  name: 'Grayden Scovil',
  tagline:
    'I build software and hardware — home servers, operating systems, simulators, and the occasional overambitious hardware experiment. Based in Colorado.',
  note: 'Some shipped, some archived, all mine. A few are below — reach out if you want to see more.',
  contactLinks: [
    { label: 'gscovil9@gmail.com', href: 'mailto:gscovil9@gmail.com' },
    { label: 'linkedin.com/in/gscovil', href: 'https://www.linkedin.com/in/gscovil/' },
    { label: 'github.com/Shadowpatriot9', href: 'https://github.com/Shadowpatriot9' },
  ],
};
