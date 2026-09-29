import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, BrainCircuit, Check, ChevronRight, Clock3, Compass, FileText, Layers3, Lightbulb, ListChecks, LoaderCircle, Pencil, Plus, RotateCcw, Sparkles, Target, TrendingUp, UserRound, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { generateCareerRoadmap } from '@workspace/api-client-react';
import { parseSkills, type CareerResult, type Profile } from '@/lib/agent';

const queryClient = new QueryClient();
const PROFILE_KEY = 'career-roadmap-profile';
const RESULT_KEY = 'career-roadmap-result';
const careers = ['Data Analyst', 'Full-Stack Developer', 'AI/ML Engineer', 'Cloud Engineer', 'Cybersecurity Analyst', 'Software Developer', 'Custom'];

function readStorage<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
function saveStorage(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isResult = location.includes('results');
  return <div className="paper-noise min-h-[100dvh] bg-background">
    <header className="relative z-10 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" data-testid="link-brand" className="focus-ring flex items-center gap-3 text-foreground no-underline">
          <span className="grid size-9 place-items-center rounded-xl bg-sidebar text-accent"><Compass size={19} /></span>
          <span><span className="block font-semibold tracking-tight">pathfinder<span className="text-primary">.</span></span><span className="mono-label hidden text-muted-foreground sm:block">career planning studio</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="mono-label hidden text-muted-foreground sm:block">BTech project · Gemini agent</span>
          <span className="size-2 rounded-full bg-accent ring-4 ring-accent/20" title="Ready" />
        </div>
      </div>
    </header>
    <main>{children}</main>
    <footer className="mx-auto mt-20 max-w-7xl border-t border-border/70 px-5 py-7 text-xs text-muted-foreground lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><span>Pathfinder / Student Skill Development Agent</span><span>Structured planning, not a shortcut.</span></div>
    </footer>
    {isResult && <div className="pointer-events-none fixed bottom-5 right-5 hidden rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm md:block"><Check className="mr-1 inline-block size-3 text-primary" /> Plan saved on this device</div>}
  </div>;
}

function Button({ children, variant = 'primary', className = '', ...props }: { children: ReactNode; variant?: 'primary' | 'quiet' | 'outline'; className?: string; [key: string]: unknown }) {
  const styles = variant === 'primary' ? 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg' : variant === 'outline' ? 'border border-border bg-card text-foreground hover:border-primary hover:text-primary' : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground';
  return <button className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${styles} ${className}`} {...props}>{children}</button>;
}

function Eyebrow({ children }: { children: ReactNode }) { return <span className="mono-label inline-flex items-center gap-2 text-primary"><span className="size-1.5 rounded-full bg-accent" />{children}</span>; }

function Home() {
  const [, setLocation] = useLocation();
  return <Shell><div className="paper-grid relative overflow-hidden">
    <div className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-accent/20 blur-3xl" />
    <section className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-28 lg:pt-24">
      <div className="fade-up flex flex-col justify-center">
        <Eyebrow>student growth / 01</Eyebrow>
        <h1 className="display-font mt-6 max-w-3xl text-5xl font-semibold leading-[.98] text-foreground sm:text-7xl">A clearer route from <span className="relative whitespace-nowrap text-primary">curious<span className="absolute -bottom-2 left-1 right-0 h-2 -rotate-1 rounded-full bg-accent/70" /></span> to career-ready.</h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">Pathfinder turns your current skills, projects, and available time into a focused sequence of practice. No vague advice. Just the next useful move.</p>
        <div className="mt-9 flex flex-wrap items-center gap-4"><Button data-testid="button-create-roadmap" onClick={() => setLocation('/profile')}>Create My Career Roadmap <ArrowRight size={17} /></Button><span className="text-xs text-muted-foreground">Takes about 3 minutes</span></div>
        <div className="mt-12 flex gap-8 border-t border-border/80 pt-5 text-sm"><div><strong className="display-font block text-2xl">06</strong><span className="text-muted-foreground">career tracks</span></div><div><strong className="display-font block text-2xl">04–06</strong><span className="text-muted-foreground">week plans</span></div><div><strong className="display-font block text-2xl">01</strong><span className="text-muted-foreground">next step</span></div></div>
      </div>
      <div className="fade-up fade-up-delay-1 relative min-h-[420px]">
        <div className="absolute inset-8 rotate-3 rounded-[2rem] border border-primary/20 bg-secondary/50" />
        <div className="relative mt-8 rounded-[2rem] border border-border bg-card p-5 card-shadow-lg sm:p-7">
          <div className="flex items-center justify-between"><div><Eyebrow>your trajectory</Eyebrow><p className="mt-2 font-semibold">From current state to next proof</p></div><span className="grid size-10 place-items-center rounded-full bg-accent/70 text-primary"><TrendingUp size={19} /></span></div>
          <svg viewBox="0 0 440 210" className="mt-8 w-full overflow-visible" role="img" aria-label="A rising career trajectory diagram"><path d="M30 180 C 90 165, 110 140, 162 148 S 226 104, 265 112 S 330 54, 410 27" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" className="draw-line" /><path d="M30 180 C 90 165, 110 140, 162 148 S 226 104, 265 112 S 330 54, 410 27" fill="none" stroke="hsl(var(--accent))" strokeWidth="10" opacity=".3" /><circle cx="30" cy="180" r="7" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="3" /><circle cx="162" cy="148" r="7" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="3" /><circle cx="265" cy="112" r="7" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="3" /><circle cx="410" cy="27" r="9" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="3" /><text x="22" y="205" className="fill-muted-foreground text-[11px]">now</text><text x="137" y="176" className="fill-muted-foreground text-[11px]">gap</text><text x="244" y="138" className="fill-muted-foreground text-[11px]">proof</text><text x="357" y="18" className="fill-primary text-[11px]">role-ready</text></svg>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><span><span className="mb-1 block size-2 rounded-full bg-secondary-foreground/30" />Profile</span><span><span className="mb-1 block size-2 rounded-full bg-primary" />Priority</span><span><span className="mb-1 block size-2 rounded-full bg-accent" />Proof</span></div>
        </div>
        <div className="absolute -bottom-1 -left-2 flex max-w-[220px] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-md"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/50 text-primary"><Target size={17} /></span><span className="text-xs leading-5"><strong className="block">One focused sequence</strong><span className="text-muted-foreground">built around your week</span></span></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="mb-7 flex items-end justify-between gap-4"><div><Eyebrow>how it works / 02</Eyebrow><h2 className="display-font mt-3 text-3xl font-semibold sm:text-4xl">The agent shows its working.</h2></div><span className="mono-label hidden text-muted-foreground sm:block">not a chatbot / a planning loop</span></div>
      <div className="grid gap-3 md:grid-cols-5">{[['01', 'Read your context', UserRound], ['02', 'Map the role', Layers3], ['03', 'Find the gap', BarChart3], ['04', 'Rank the next skills', ListChecks], ['05', 'Build your sequence', Compass]].map(([number, title, Icon], index) => { const StepIcon = Icon as typeof UserRound; return <div key={number as string} className={`fade-up fade-up-delay-${Math.min(index + 1, 3)} rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-1`}><span className="mono-label text-primary">{number as string}</span><StepIcon className="mt-8 size-5 text-muted-foreground" /><p className="mt-4 text-sm font-semibold leading-5">{title as string}</p></div>; })}</div>
    </section>
  </div></Shell>;
}

function ProfilePage() {
  const [, setLocation] = useLocation();
  const saved = readStorage<Profile>(PROFILE_KEY);
  const [form, setForm] = useState<Profile>(saved ?? { name: '', degree: '', skills: [], projects: '', career: '', customCareer: '', experience: '', learningTime: '' });
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const update = (key: keyof Profile, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const addSkills = () => { const incoming = parseSkills(skillInput); if (!incoming.length) return; setForm((current) => ({ ...current, skills: parseSkills([...current.skills, ...incoming]) })); setSkillInput(''); };
  const removeSkill = (skill: string) => setForm((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name.trim() || !form.degree || !form.career || !form.experience || !form.learningTime) { setError('Complete the highlighted essentials before generating your roadmap.'); return; } if (form.career === 'Custom' && !form.customCareer.trim()) { setError('Add the career you want to explore so the agent can set a useful baseline.'); return; } saveStorage(PROFILE_KEY, form); localStorage.removeItem(RESULT_KEY); setLocation('/processing'); };
  return <Shell><div className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8"><Link href="/" data-testid="link-back-home" className="focus-ring inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-foreground"><ArrowLeft size={15} /> Back to overview</Link><div className="mt-10 grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20"><div className="lg:pt-7"><Eyebrow>profile builder / 01</Eyebrow><h1 className="display-font mt-5 text-4xl font-semibold leading-tight sm:text-5xl">Give the agent a useful starting point.</h1><p className="mt-5 max-w-md leading-7 text-muted-foreground">Your answers do not need to be perfect. Honest context creates a more realistic sequence than a long list of aspirational skills.</p><div className="mt-10 rounded-2xl border border-border bg-secondary/45 p-5"><div className="flex gap-3"><Sparkles size={18} className="mt-0.5 shrink-0 text-primary" /><p className="text-sm leading-6 text-foreground/80"><strong>Good to know:</strong> your profile and roadmap stay in this browser only. You can edit the inputs any time.</p></div></div></div><form onSubmit={submit} className="rounded-3xl border border-border bg-card p-5 card-shadow sm:p-8"><div className="grid gap-6 sm:grid-cols-2"><Field label="Your name" required><input data-testid="input-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Riya Sharma" className="form-input" /></Field><Field label="Degree / branch" required><input data-testid="input-degree" value={form.degree} onChange={(e) => update('degree', e.target.value)} placeholder="e.g. BTech CSE, 3rd year" className="form-input" /></Field><div className="sm:col-span-2"><Field label="Current skills"><div className="flex gap-2"><input data-testid="input-skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkills(); } }} placeholder="Type a skill and press Enter" className="form-input" /><Button type="button" variant="outline" data-testid="button-add-skill" onClick={addSkills} className="shrink-0 px-3"><Plus size={17} /></Button></div><p className="mt-2 text-xs text-muted-foreground">Comma or newline separated works too.</p><div className="mt-3 flex flex-wrap gap-2">{form.skills.map((skill) => <span key={skill} data-testid={`chip-skill-${skill.toLowerCase().replace(/\W+/g, '-')}`} className="inline-flex items-center gap-1.5 rounded-full bg-accent/45 px-3 py-1.5 text-xs font-semibold text-foreground">{skill}<button type="button" data-testid={`button-remove-skill-${skill.toLowerCase().replace(/\W+/g, '-')}`} onClick={() => removeSkill(skill)} className="focus-ring rounded-full text-muted-foreground hover:text-destructive"><X size={13} /></button></span>)}</div></Field></div><div className="sm:col-span-2"><Field label="Existing projects"><textarea data-testid="input-projects" value={form.projects} onChange={(e) => update('projects', e.target.value)} rows={3} placeholder="What have you built, explored, or contributed to? One project per line." className="form-input resize-none" /></Field></div><div className="sm:col-span-2"><Field label="Target career" required><div className="grid gap-2 sm:grid-cols-2">{careers.map((career) => <button type="button" key={career} data-testid={`button-career-${career.toLowerCase().replace(/[^a-z]+/g, '-')}`} onClick={() => update('career', career)} className={`focus-ring rounded-xl border px-4 py-3 text-left text-sm transition-colors ${form.career === career ? 'border-primary bg-primary/8 font-semibold text-primary' : 'border-border bg-background hover:border-primary/50'}`}><span className="flex items-center justify-between">{career}{form.career === career && <Check size={16} />}</span></button>)}</div>{form.career === 'Custom' && <input data-testid="input-custom-career" value={form.customCareer} onChange={(e) => update('customCareer', e.target.value)} placeholder="Name your target career" className="form-input mt-3" />}</Field></div><Field label="Experience level" required><select data-testid="select-experience" value={form.experience} onChange={(e) => update('experience', e.target.value)} className="form-input"><option value="">Choose one</option><option>Just starting</option><option>Building confidence</option><option>Some real-world experience</option></select></Field><Field label="Available learning time" required><select data-testid="select-learning-time" value={form.learningTime} onChange={(e) => update('learningTime', e.target.value)} className="form-input"><option value="">Choose one</option><option>1–3 hours / week</option><option>5–7 hours / week</option><option>8–12 hours / week</option></select></Field></div>{error && <div data-testid="status-profile-error" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}<div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6"><span className="text-xs text-muted-foreground">Step 1 of 2 · you can edit this later</span><Button type="submit" data-testid="button-generate-roadmap">Generate My Roadmap <ArrowRight size={17} /></Button></div></form></div></div></Shell>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) { return <label className="block text-sm font-semibold">{label}{required && <span className="ml-1 text-primary">*</span>}<span className="mt-2 block font-normal">{children}</span></label>; }

const stages = [
  ['profile', 'Reading your profile', 'Connecting your degree, projects, skills, and available time.'],
  ['requirements', 'Mapping career requirements', 'Comparing your target role with a practical skill baseline.'],
  ['gaps', 'Detecting skill gaps', 'Separating strengths you can use now from skills to build next.'],
  ['priorities', 'Ranking your next moves', 'Putting foundational skills before impressive but premature ones.'],
  ['roadmap', 'Sequencing your learning', 'Turning priorities into a week-by-week practice loop.'],
];

function ProcessingPage() {
  const [, setLocation] = useLocation();
  const [profile] = useState<Profile | null>(() => readStorage<Profile>(PROFILE_KEY));
  const [active, setActive] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!profile) {
      setLocation('/profile');
      return;
    }

    let cancelled = false;
    const timers = stages.map((_, index) => window.setTimeout(() => {
      if (!cancelled) setActive(index);
    }, index * 800));

    const generate = async () => {
      try {
        const result = await generateCareerRoadmap(profile);
        if (!cancelled) {
          setActive(stages.length);
          saveStorage(RESULT_KEY, result);
          window.setTimeout(() => {
            if (!cancelled) setLocation('/results');
          }, 500);
        }
      } catch (generationError) {
        if (!cancelled) {
          setError(generationError instanceof Error && generationError.message
            ? 'Unable to generate the roadmap right now. Please check your connection and try again.'
            : 'Unable to generate the roadmap right now. Please try again.');
        }
      }
    };

    void generate();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [profile, setLocation]);

  return <Shell><div className="mx-auto flex min-h-[72vh] max-w-3xl flex-col justify-center px-5 py-20 lg:px-8"><div className="fade-up text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-sidebar text-accent"><BrainCircuit size={30} className="animate-pulse" /></div><Eyebrow>agent in progress / 02</Eyebrow><h1 className="display-font mt-5 text-4xl font-semibold sm:text-5xl">Building your route<span className="text-primary">.</span></h1><p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">Gemini is analyzing your profile and making each planning step visible.</p></div><div className="mt-12 overflow-hidden rounded-3xl border border-border bg-card card-shadow">{stages.map(([id, title, description], index) => <div key={id} data-testid={`processing-step-${id}`} className={`flex gap-4 border-b border-border p-5 last:border-0 transition-colors ${index <= active ? 'bg-primary/[.035]' : ''}`}><div className={`grid size-9 shrink-0 place-items-center rounded-full border text-sm ${index < active ? 'border-primary bg-primary text-primary-foreground' : index === active ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>{index < active ? <Check size={16} /> : index === active ? <LoaderCircle size={16} className="animate-spin" /> : <span>0{index + 1}</span>}</div><div><p className={`text-sm font-semibold ${index <= active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div><span className="ml-auto hidden self-center text-xs text-primary sm:block">{index < active ? 'complete' : index === active ? 'working' : 'queued'}</span></div>)}</div>{error ? <div className="mt-7 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center"><p data-testid="status-processing-error" className="text-sm text-destructive">{error}</p><Button data-testid="button-retry-roadmap" className="mt-4" onClick={() => window.location.reload()}>Try again <RotateCcw size={15} /></Button></div> : <p data-testid="status-processing" className="mono-label mx-auto mt-7 text-muted-foreground">Gemini is creating a structured plan from your profile</p>}</div></Shell>;
}

function ResultsPage() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<CareerResult | null>(() => readStorage<CareerResult>(RESULT_KEY));
  const [profile] = useState<Profile | null>(() => readStorage<Profile>(PROFILE_KEY));
  const [expandedProject, setExpandedProject] = useState(0);
  const initials = useMemo(() => profile?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? 'ST', [profile]);
  if (!result || !profile) return <Shell><div className="mx-auto max-w-xl px-5 py-28 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><FileText size={24} /></div><h1 className="display-font mt-5 text-3xl font-semibold">No roadmap yet</h1><p className="mt-3 text-muted-foreground">Create a profile first and the agent will have something to work with.</p><Button data-testid="button-empty-create" className="mt-7" onClick={() => setLocation('/profile')}>Create profile <ArrowRight size={16} /></Button></div></Shell>;
  return <Shell><div className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><Eyebrow>your roadmap / 03</Eyebrow><h1 className="display-font mt-4 text-4xl font-semibold sm:text-5xl">A route worth taking.</h1><p data-testid="result-profile-summary" className="mt-3 text-muted-foreground">Built for <strong className="text-foreground">{profile.name}</strong> · {profile.degree}</p></div><div className="flex gap-2"><Button variant="outline" data-testid="button-edit-profile" onClick={() => setLocation('/profile')}><Pencil size={15} /> Edit profile</Button><Button variant="quiet" data-testid="button-start-over" onClick={() => { localStorage.removeItem(PROFILE_KEY); localStorage.removeItem(RESULT_KEY); setLocation('/profile'); }}><RotateCcw size={15} /> Start over</Button></div></div><section className="mt-10 grid gap-4 lg:grid-cols-[1.5fr_.7fr]"><div data-testid="result-career-goal" className="relative overflow-hidden rounded-3xl bg-sidebar p-7 text-sidebar-foreground sm:p-9"><div className="absolute -right-14 -top-20 size-64 rounded-full border-[32px] border-accent/15" /><div className="relative"><span className="mono-label text-accent">target career</span><h2 className="display-font mt-4 max-w-2xl text-4xl font-semibold leading-tight text-sidebar-foreground sm:text-5xl">{result.career}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-sidebar-foreground/70">{profile.experience} · {profile.learningTime} · {profile.skills.length} current skill{profile.skills.length === 1 ? '' : 's'} mapped</p><div className="mt-8 flex flex-wrap gap-2">{result.requirements.slice(0, 4).map((item, index) => <span data-testid={`result-requirement-${index}`} key={item} className="rounded-full border border-sidebar-foreground/15 px-3 py-1.5 text-xs text-sidebar-foreground/80">{item}</span>)}</div></div></div><div className="rounded-3xl border border-border bg-card p-7 card-shadow"><span className="mono-label text-muted-foreground">indicative readiness</span><div className="mt-5 flex items-end gap-2"><strong data-testid="result-readiness" className="display-font text-6xl font-semibold text-primary">{result.readiness}</strong><span className="pb-2 text-lg text-muted-foreground">/ 100</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${result.readiness}%` }} /></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Indicative only. This score reflects the inputs you shared, not a hiring prediction.</p></div></section><div className="mt-4 grid gap-4 lg:grid-cols-3"><ResultCard icon={<Check size={17} />} label="Current strengths" value={result.strengths.length ? `${result.strengths.length} mapped` : 'A fresh baseline'}><div className="flex flex-wrap gap-2">{(result.strengths.length ? result.strengths : ['Open to build']).map((item) => <span data-testid={`result-strength-${item.toLowerCase().replace(/\W+/g, '-')}`} key={item} className="rounded-full bg-accent/40 px-2.5 py-1 text-xs font-semibold">{item}</span>)}</div></ResultCard><ResultCard icon={<BarChart3 size={17} />} label="Skills to build" value={`${result.gaps.length} priority gaps`}><p data-testid="result-missing-skills" className="text-sm leading-6 text-muted-foreground">{result.gaps.slice(0, 3).join(' · ') || 'Keep sharpening what you already know.'}</p></ResultCard><ResultCard icon={<Clock3 size={17} />} label="Your weekly rhythm" value={profile.learningTime}><p data-testid="result-learning-rhythm" className="text-sm leading-6 text-muted-foreground">A plan shaped around consistency, with project proof at the end.</p></ResultCard></div><div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_.95fr]"><section><SectionHeading index="04" title="Priority queue" subtitle="Build the foundations in this order." /><div className="mt-6 space-y-2">{(result.priorities.length ? result.priorities : ['Practice the fundamentals of your target role']).map((item, index) => <div key={item} data-testid={`result-priority-${index}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-transform hover:translate-x-1"><span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${index === 0 ? 'bg-accent text-foreground' : 'bg-secondary text-primary'}`}>0{index + 1}</span><span className="flex-1 text-sm font-semibold">{item}</span><ChevronRight size={16} className="text-muted-foreground" /></div>)}</div></section><section><SectionHeading index="05" title="Learning sequence" subtitle="A pace you can actually sustain." /><div className="relative mt-6 space-y-3 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-border">{result.roadmap.map((step, index) => <div key={step.week} data-testid={`result-roadmap-${index}`} className="relative flex gap-4"><span className="z-10 mt-1 grid size-9 shrink-0 place-items-center rounded-full border-4 border-background bg-primary text-[10px] font-bold text-primary-foreground">{index + 1}</span><div className="flex-1 rounded-2xl border border-border bg-card p-4"><div className="flex flex-wrap justify-between gap-2"><span className="mono-label text-primary">{step.week}</span><span className="text-xs text-muted-foreground">{index === result.roadmap.length - 1 ? 'proof point' : 'practice'}</span></div><p className="mt-2 text-sm font-semibold">{step.focus}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{step.outcome}</p></div></div>)}</div></section></div><section className="mt-12"><SectionHeading index="06" title="Projects that prove it" subtitle="Small, specific evidence beats a long course list." /><div className="mt-6 grid gap-4 md:grid-cols-2">{result.projects.map((project, index) => <article key={project.title} data-testid={`result-project-${index}`} className={`rounded-3xl border p-6 transition-colors ${expandedProject === index ? 'border-primary/40 bg-card card-shadow' : 'border-border bg-card/50'}`}><button type="button" data-testid={`button-project-${index}`} onClick={() => setExpandedProject(expandedProject === index ? -1 : index)} className="focus-ring flex w-full items-start justify-between gap-5 text-left"><div><span className="mono-label text-muted-foreground">project 0{index + 1}</span><h3 className="display-font mt-3 text-2xl font-semibold">{project.title}</h3></div><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">{expandedProject === index ? <X size={16} /> : <Plus size={16} />}</span></button>{expandedProject === index && <div className="fade-up mt-5 border-t border-border pt-5"><p className="text-sm leading-6 text-muted-foreground">{project.description}</p><p className="mono-label mt-5 text-muted-foreground">skills demonstrated</p><div className="mt-2 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className="rounded-full bg-accent/40 px-2.5 py-1 text-xs font-semibold">{skill}</span>)}</div></div>}</article>)}</div></section><section className="mt-12 grid gap-5 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8 md:grid-cols-[auto_1fr]"><div className="grid size-12 place-items-center rounded-2xl bg-accent text-primary"><Lightbulb size={22} /></div><div><span className="mono-label text-primary">the agent's read</span><p data-testid="result-recommendation" className="mt-3 max-w-3xl text-lg font-medium leading-8 text-foreground">{result.recommendation}</p></div></section></div></Shell>;
}

function ResultCard({ icon, label, value, children }: { icon: ReactNode; label: string; value: string; children: ReactNode }) { return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-primary">{icon}<span className="mono-label text-muted-foreground">{label}</span></div><p className="mt-4 text-sm font-semibold">{value}</p><div className="mt-3">{children}</div></div>; }
function SectionHeading({ index, title, subtitle }: { index: string; title: string; subtitle: string }) { return <div className="flex items-start gap-4"><span className="mono-label mt-1 text-primary">{index}</span><div><h2 className="display-font text-3xl font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div></div>; }

function Router() { return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route path="/profile" component={ProfilePage} /><Route path="/processing" component={ProcessingPage} /><Route path="/results" component={ResultsPage} /><Route component={NotFound} /></Switch></ErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;