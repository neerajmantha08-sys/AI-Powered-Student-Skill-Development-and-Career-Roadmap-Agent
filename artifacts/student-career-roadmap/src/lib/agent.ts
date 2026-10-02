export type Profile = {
  name: string;
  degree: string;
  skills: string[];
  projects: string;
  career: string;
  customCareer: string;
  experience: string;
  learningTime: string;
};

export type ProjectIdea = {
  title: string;
  description: string;
  skills: string[];
};

export type RoadmapStep = {
  week: string;
  focus: string;
  outcome: string;
};

export type CareerResult = {
  career: string;
  requirements: string[];
  strengths: string[];
  gaps: string[];
  priorities: string[];
  readiness: number;
  projects: ProjectIdea[];
  roadmap: RoadmapStep[];
  recommendation: string;
};

const aliases: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  reactjs: 'React',
  'react.js': 'React',
  sql: 'SQL',
  python: 'Python',
  git: 'Git',
  linux: 'Linux',
  html: 'HTML & CSS',
  css: 'HTML & CSS',
  statistics: 'Statistics',
  stats: 'Statistics',
  'machine learning': 'Machine learning',
  ml: 'Machine learning',
  networking: 'Networking',
  docker: 'Containers',
  excel: 'Excel & data cleaning',
};

export function parseSkills(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : value.split(/,|\n/);
  const seen = new Set<string>();
  const normalized: string[] = [];

  values.forEach((item) => {
    const cleaned = item.trim().replace(/\s+/g, ' ');
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    const skill = aliases[key] ?? cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
    if (seen.has(skill.toLowerCase())) return;
    seen.add(skill.toLowerCase());
    normalized.push(skill);
  });

  return normalized;
}