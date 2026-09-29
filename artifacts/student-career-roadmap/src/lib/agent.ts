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

export type ProjectIdea = { title: string; description: string; skills: string[] };
export type RoadmapStep = { week: string; focus: string; outcome: string };
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

type CareerBlueprint = { requirements: string[]; projects: ProjectIdea[] };

const blueprints: Record<string, CareerBlueprint> = {
  'Data Analyst': {
    requirements: ['Excel & data cleaning', 'SQL', 'Statistics', 'Python', 'Data visualization', 'Storytelling with data'],
    projects: [
      { title: 'Campus pulse dashboard', description: 'Turn a small student survey into a decision-ready dashboard with a written insight brief.', skills: ['SQL', 'Data visualization', 'Storytelling with data'] },
      { title: 'Placement trend investigation', description: 'Explore placement data, test two hypotheses, and explain the limits of your analysis.', skills: ['Python', 'Statistics', 'Data cleaning'] },
    ],
  },
  'Full-Stack Developer': {
    requirements: ['HTML & CSS', 'JavaScript', 'React', 'Backend APIs', 'Databases', 'Git & deployment'],
    projects: [
      { title: 'Team project tracker', description: 'Build a role-aware app that helps a student team plan, ship, and review work.', skills: ['React', 'Backend APIs', 'Databases'] },
      { title: 'Public API showcase', description: 'Create a polished client for a public API with caching, loading, and error states.', skills: ['JavaScript', 'Git & deployment', 'HTML & CSS'] },
    ],
  },
  'AI/ML Engineer': {
    requirements: ['Python', 'Linear algebra & statistics', 'Machine learning', 'Data preparation', 'Model evaluation', 'MLOps basics'],
    projects: [
      { title: 'Placement outcome predictor', description: 'Train, evaluate, and document a model while making its assumptions visible.', skills: ['Python', 'Machine learning', 'Model evaluation'] },
      { title: 'Searchable study notes', description: 'Build a small retrieval system and compare its results against a simple baseline.', skills: ['Data preparation', 'MLOps basics', 'Python'] },
    ],
  },
  'Cloud Engineer': {
    requirements: ['Linux', 'Networking', 'Cloud fundamentals', 'Containers', 'Infrastructure as code', 'Monitoring'],
    projects: [
      { title: 'Reliable student portal', description: 'Deploy a small service with a repeatable environment, health checks, and an incident note.', skills: ['Cloud fundamentals', 'Monitoring', 'Linux'] },
      { title: 'Container lab', description: 'Package a multi-service app and document its networking and deployment decisions.', skills: ['Containers', 'Networking', 'Infrastructure as code'] },
    ],
  },
  'Cybersecurity Analyst': {
    requirements: ['Networking', 'Linux', 'Security fundamentals', 'Python scripting', 'Threat analysis', 'Incident response'],
    projects: [
      { title: 'Campus network threat brief', description: 'Model a realistic threat scenario and produce a prioritized response playbook.', skills: ['Threat analysis', 'Networking', 'Incident response'] },
      { title: 'Log anomaly scanner', description: 'Write a script that surfaces suspicious patterns in synthetic authentication logs.', skills: ['Python scripting', 'Linux', 'Security fundamentals'] },
    ],
  },
  'Software Developer': {
    requirements: ['Programming fundamentals', 'Data structures & algorithms', 'Object-oriented design', 'Git', 'Testing', 'Problem solving'],
    projects: [
      { title: 'Library queue simulator', description: 'Design, test, and benchmark a small system that handles competing reservations.', skills: ['Data structures & algorithms', 'Testing', 'Object-oriented design'] },
      { title: 'Open-source starter contribution', description: 'Choose a small issue, submit a thoughtful patch, and write the engineering notes.', skills: ['Git', 'Problem solving', 'Programming fundamentals'] },
    ],
  },
};

const customBlueprint: CareerBlueprint = {
  requirements: ['Programming fundamentals', 'Data literacy', 'Problem solving', 'Git & collaboration', 'Communication', 'Domain research'],
  projects: [
    { title: 'Career-domain proof of work', description: 'Pick one problem in your target domain and ship a small, documented solution from research to demo.', skills: ['Problem solving', 'Domain research', 'Communication'] },
    { title: 'Technical learning log', description: 'Publish three short build notes that show what you learned, changed, and would improve next.', skills: ['Programming fundamentals', 'Git & collaboration', 'Data literacy'] },
  ],
};

const aliases: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript', reactjs: 'React', 'react.js': 'React',
  sql: 'SQL', python: 'Python', git: 'Git', linux: 'Linux', html: 'HTML & CSS', css: 'HTML & CSS',
  statistics: 'Statistics', stats: 'Statistics', 'machine learning': 'Machine learning',
  ml: 'Machine learning', networking: 'Networking', docker: 'Containers', excel: 'Excel & data cleaning',
};

export function parseSkills(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : value.split(/,|\n/);
  const seen = new Set<string>();
  values.forEach((item) => {
    const cleaned = item.trim().replace(/\s+/g, ' ');
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    const normalized = aliases[key] ?? cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
    if (!seen.has(normalized.toLowerCase())) seen.add(normalized.toLowerCase());
  });
  return Array.from(seen).map((key) => Array.from(values).find((value) => value.trim().toLowerCase() === key)?.trim() ?? aliases[key] ?? key.replace(/\b\w/g, (letter) => letter.toUpperCase()));
}

function canonical(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ''); }

export function analyzeStudentProfile(profile: Profile) {
  return { ...profile, skills: parseSkills(profile.skills), projectCount: profile.projects.trim() ? profile.projects.split(/\n+/).filter(Boolean).length : 0 };
}

export function analyzeCareerRequirements(career: string) {
  return blueprints[career] ?? customBlueprint;
}

export function identifySkillGaps(profile: Profile, requirements: string[]) {
  const normalizedSkills = profile.skills.map(canonical);
  return requirements.filter((requirement) => !normalizedSkills.some((skill) => skill.includes(canonical(requirement)) || canonical(requirement).includes(skill)));
}

export function prioritizeSkills(gaps: string[]) {
  return [...gaps].sort((a, b) => {
    const foundation = ['Programming fundamentals', 'Data literacy', 'Linux', 'Networking', 'HTML & CSS'];
    return (foundation.includes(a) ? -1 : 0) - (foundation.includes(b) ? -1 : 0);
  });
}

export function createLearningRoadmap(profile: Profile, priorities: string[]): RoadmapStep[] {
  const weeks = profile.learningTime.includes('5–7') ? 6 : profile.learningTime.includes('8–12') ? 5 : 4;
  const steps = priorities.slice(0, Math.max(3, Math.min(priorities.length, weeks)));
  return steps.map((skill, index) => ({
    week: `Week ${index + 1}`,
    focus: index === 0 ? `${skill} foundations` : skill,
    outcome: index === 0 ? `Complete a guided practice set and explain the core concepts in your own words.` : `Ship one small exercise that connects ${skill} to your target role.`,
  })).concat(steps.length < weeks ? [{ week: `Week ${weeks}`, focus: 'Portfolio proof & reflection', outcome: 'Package your best project, document decisions, and identify the next interview-ready gap.' }] : []);
}

export function recommendProjects(profile: Profile, career: string) {
  const projects = analyzeCareerRequirements(career).projects;
  return projects.map((project, index) => index === 0 && profile.experience === 'Just starting' ? { ...project, description: `${project.description} Start with a smaller version, then add one stretch feature.` } : project);
}

export function generateFinalPlan(input: Profile): CareerResult {
  const profile = analyzeStudentProfile(input);
  const selectedCareer = input.career === 'Custom' ? (input.customCareer.trim() || 'Custom technology path') : input.career;
  const blueprint = analyzeCareerRequirements(input.career);
  const strengths = blueprint.requirements.filter((requirement) => profile.skills.some((skill) => canonical(skill).includes(canonical(requirement)) || canonical(requirement).includes(canonical(skill))));
  const gaps = identifySkillGaps(profile, blueprint.requirements);
  const priorities = prioritizeSkills(gaps);
  const readiness = Math.max(18, Math.min(92, Math.round(35 + strengths.length * 9 - gaps.length * 3 + (profile.projectCount ? 8 : 0))));
  const customNote = input.career === 'Custom' ? ' This is an indicative starting point for a custom target; validate it against real job descriptions.' : '';
  return {
    career: selectedCareer,
    requirements: blueprint.requirements,
    strengths,
    gaps,
    priorities,
    readiness,
    projects: recommendProjects(input, input.career),
    roadmap: createLearningRoadmap(input, priorities),
    recommendation: `Build one visible proof point before adding another course. Your next best move is to practice ${priorities[0] ?? 'the role fundamentals'} in a small project, then reflect on what changed.${customNote}`,
  };
}