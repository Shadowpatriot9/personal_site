export interface Project {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technology: string[];
  tags: string[];
  route: string;
  path?: string;
  link?: string;
  body?: string;
  dateCreated: string | null;
  updatedAt?: string | null;
  raw?: Record<string, unknown>;
}

export const PROJECT_STATUS_OPTIONS = [
  'Active',
  'In Progress',
  'Completed',
  'Paused',
  'Discontinued',
];

export const PROJECT_CATEGORY_OPTIONS = [
  'Software',
  'Hardware',
  'Research',
  'Creative',
  'Community',
  'Other',
];

// Route must start with a forward slash and may include alphanumeric characters,
// forward slashes, underscores, or hyphens.
export const PROJECT_ROUTE_PATTERN = /^\/[A-Za-z0-9/_-]+$/;

export const DEFAULT_PROJECT_CATEGORY = PROJECT_CATEGORY_OPTIONS[0];
export const DEFAULT_PROJECT_STATUS = PROJECT_STATUS_OPTIONS[0];

export const fallbackProjects: Project[] = [
  {
    id: 'sim',
    title: 'S_im',
    description: 'Shadow Simulator',
    category: 'Software',
    status: 'In Progress',
    technology: ['Simulation', 'Software'],
    tags: ['simulation', 'software', 'development'],
    route: '/projects/sim',
    dateCreated: '2024-01-01',
    link: 'https://github.com/Shadowpatriot9/S_im',
    body: 'A work in progress. Check the repo for the latest.',
  },
  {
    id: 'sos',
    title: 'sOS',
    description: 'Shadow Operating System',
    category: 'Software',
    status: 'In Progress',
    technology: ['Operating System', 'Low-level'],
    tags: ['os', 'system', 'low-level', 'kernel'],
    route: '/projects/sos',
    dateCreated: '2023-06-15',
    link: 'https://github.com/Shadowpatriot9/sOS',
    body: 'A work in progress. Check the repo for the latest.',
  },
  {
    id: 's9',
    title: 'S9',
    description: 'Shadow Home Server',
    category: 'Hardware',
    status: 'Active',
    technology: ['Server', 'Networking', 'Linux'],
    tags: ['server', 'networking', 'nas', 'ubuntu', 'homelab'],
    route: '/projects/s9',
    dateCreated: '2024-10-01',
    body: [
      'This is some info about my home server. I mainly use it for redundancy to my PAN and in specific cases to allow more integration all around for files or other client-to-client connections. Trying to develop it further as an all-around hosting platform idea for software development purposes, but still working out the kinks to optimize the development workflow on it. Feel free to check her out below. 😊',
      '',
      '## Features',
      '- Backup NAS file system (NAS via NFS)',
      '- VM hosting (VirtualBox w/ specific OS imaged to preference)',
      '- Accessible anywhere (SSH and AnyDesk for RDP)',
      '- Monitoring (HTOP, WireShark, Prometheus)',
      '- Auto config script + auto-install ISO for re-imaging',
      '',
      '## Specifications',
      '- OS: Ubuntu Server w/ GNOME Desktop',
      '- CPU: i7-13700K',
      '- RAM: 32GB DDR5 5600',
      '- Storage: 1TB NVMe',
      '- Secret name: Sally',
    ].join('\n'),
  },
  {
    id: 'nfi',
    title: 'NFI',
    description: 'Rocket Propulsion System',
    category: 'Hardware',
    status: 'Completed',
    technology: ['Aerospace', 'Engineering'],
    tags: ['rocket', 'propulsion', 'aerospace', 'engineering'],
    route: '/projects/nfi',
    dateCreated: '2022-03-01',
    body: [
      'Discontinued as of 05/2021.',
      '',
      "NFI was a project I started in October of 2020. The goal was to design and create a rocket propulsion system aimed at a more efficient way of travel for a 2nd-stage launch vehicle, to accomplish a long-distance journey in an optimal time (e.g. a journey to Jupiter). The project itself went no further than the conceptual design phase — the main limitation being a lack of education/knowledge to develop this system independently as intended. I'm showcasing this incomplete, archived project because exploring it allowed for a lot of self-reflection and reignited my interest in engineering, which led to me moving to a different location and pursuing higher education in an engineering discipline with an application in aerospace.",
      '',
      '## Background',
      'The design had a few core and sub systems apart from the generic main components of a traditional propulsion system. After several iterations, the main influence of the concept revolved around reigniting an old idea and applying it with modern capabilities.',
      '',
      'More specifically, it revolved around the "Bussard Ramjet," introduced in 1960 by physicist Robert Bussard. The idea was to (in theory) collect hydrogen gas in space during travel and use it as a fuel source simultaneously in transit, by deploying a large magnetic field to collect the gas as the vehicle continued. It was never implemented due to the lack of technology and our limited data of space in general, but the idea was continuously revisited over the years — each revisit hitting an implementation complication, primarily due to the lack of technology.',
    ].join('\n'),
  },
  {
    id: 'muse',
    title: 'Muse',
    description: 'Automated Audio Equalizer',
    category: 'Hardware',
    status: 'Discontinued',
    technology: ['Audio', 'Electronics'],
    tags: ['audio', 'music', 'equalizer', 'electronics'],
    route: '/projects/muse',
    dateCreated: '2018-03-01',
    body: [
      'Discontinued as of 05/2019.',
      '',
      'Out of all my projects I attempted to complete, Muse was probably the closest I got to something actually tangible. The idea for Muse (inspired by the Greek mythical god of music 😀) was to be a device where a novice songwriter could use it as an audio interface to both record and save their music — but also be completely automated, with audio production editing tools built in. That way the user would only need to worry about the creative process of making a song and let the device handle all the technicals of audio production, so it could be deployed on a music hosting platform sounding professionally processed.',
      '',
      "I took this through an initial concept phase — making valid electrical circuit schematics and device design drafts — and took it as far as trying to build a simple speaker using off-the-shelf components with basic volume and equalizer ability. Unfortunately that's where the story ends for now. I'd pick it up for a month, drop it, pick it up for a week a year later, then drop it again. I don't see it as a drawback though — I still had my takeaways, and it was a fun little project. The only one where I tried to make a two-foot-tall wooden speaker box in my one-bedroom apartment with a jigsaw... I'm sure my neighbors loved me for that one. 😅",
      '',
      '## Background',
      "Around this time I was really into music. I'd recently completed a college elective on audio production and would occasionally write a little song on my keyboard or guitar. The inspiration came from doodling on my guitar and running into a mental block — because I was thinking about all the small steps of setting up my mics and audio gear that I'd just get lazy and not want to record. And that's pretty much it: just being lazy, think of a robot, and boom — million dollar idea. 😂",
    ].join('\n'),
  },
  {
    id: 'el',
    title: 'EyeLearn',
    description: 'Academia AR/VR Headset',
    category: 'Hardware',
    status: 'Paused',
    technology: ['AR/VR', 'Education'],
    tags: ['ar', 'vr', 'education', 'headset', 'learning'],
    route: '/projects/el',
    dateCreated: '2021-09-01',
    body: [
      'Discontinued as of 12/2017.',
      '',
      'EyeLearn began as a school project during some of my years in college. It was an innovation class where you learn about design principles and how to apply them to real-world problems; near the end we had to come up with a project as a team and document the process like an initial design proposal. We focused on helping students engage more in class, and came up with a headset integrating augmented and virtual reality.',
      '',
      'The idea was to let the student use the headset like a normal pair of glasses to view the lecture — but if they wanted further understanding or clarification, they could use the headset concurrently to seek further resources and engaging media (videos, images, etc.), raising their comprehension without skipping a beat.',
      '',
      "The project came to an end as the assignment ended; as a group we didn't have the technical competency to make it a reality, and despite efforts to continue over the summer it ended up being no more than an idea due to other priorities and lack of knowledge.",
      '',
      '## Background',
      'The idea was influenced by our environment at the time. This was 2017, and tech was starting to see breakthroughs in VR with the Oculus Rift and HTC Vive. A lot of other groups were focusing on typical problems (parking... my god, 4 out of ~10 teams did something about parking lol), so we wanted to do something in a different area where no one was looking. Then we were off.',
    ].join('\n'),
  },
  {
    id: 'naton',
    title: 'Naton',
    description: 'Element Converter',
    category: 'Hardware',
    status: 'Completed',
    technology: ['Chemistry', 'Physics'],
    tags: ['chemistry', 'physics', 'converter', 'elements'],
    route: '/projects/naton',
    dateCreated: '2020-01-15',
    body: [
      'Discontinued as of 08/2017.',
      '',
      'Naton will be remembered as the first project I pursued as an official effort. The idea was ambitious: a machine that, with a base input of water, would atomically convert the H2O molecule into a chosen element in a basic geometric shape. It was briefly attempted during my summer break between college semesters, independently — and was my first introduction to reaching higher-ups. Although the main limitation was a lack of education/knowledge, I got the design to a basic conceptual process and reached out to academia nationally to obtain feedback and criticism.',
      '',
      'Although most feedback was that it was impractical or flat-out incorrect, the main takeaway was the ability to take a concept, break it into several components, and create something I then had to communicate with others to validate on a technical level (and I learned some science and engineering concepts, plus small skills like CAD and technical writing). With the intent of the project becoming a business, I used that momentum to reach out to academia department heads and other executive leaders in my city, and got a lot of advice and words of wisdom about how they viewed their roles in leadership.',
      '',
      '## Background',
      'It started with a picture. I was looking for a wallpaper, on a sci-fi kick, and came across an image of a person on a hill overlooking a space station off in the horizon — designed as a cube, but at a scale so large the people next to it were the size of ants. I was intrigued by the size, and started thinking about how it would be built, and more importantly how it could be built practically.',
      '',
      "After much thought, I came to the idea that we (as a species) needed a better way to obtain materials — which led to the idea of a duplicator machine (yes, like in Star Trek lol). I narrowed the scope down to simply converting a base element into another. Water was chosen as the ideal input for two reasons: it's the most abundant resource on the planet, and it's a simple molecule to break down. Once finalized, it was off to the races of concepts and designs. 😀",
    ].join('\n'),
  },
];

export const normalizeProject = (source: any): Project | null => {
  if (!source) {
    return null;
  }

  const id = source.id || source.slug || source._id || '';
  const derivedRoute = source.route || source.path || (id ? `/projects/${id}` : '#');
  const slugFromRoute = derivedRoute?.split?.('/')?.filter(Boolean).pop();
  const slug = (source.slug || slugFromRoute || id || '').toLowerCase();

  const tags = Array.isArray(source.tags)
    ? source.tags
    : Array.isArray(source.technology)
      ? source.technology
      : [];

  const technology = Array.isArray(source.technology) ? source.technology : tags;

  return {
    id,
    slug,
    title: source.title || 'Untitled Project',
    description: source.description || '',
    category: source.category || source.type || 'Uncategorized',
    status: source.status || source.stage || 'Unknown',
    tags,
    technology,
    dateCreated: source.dateCreated || source.createdAt || null,
    updatedAt: source.updatedAt || null,
    route: derivedRoute,
    path: source.path || derivedRoute,
    raw: source,
  };
};
