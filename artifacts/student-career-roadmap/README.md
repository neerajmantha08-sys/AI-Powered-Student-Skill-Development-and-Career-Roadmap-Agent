# AI-Powered Student Skill Development & Career Roadmap Agent

Pathfinder is a BTech academic project that helps students turn their current
skills, projects, target career, experience level, and available study time
into a focused learning and project plan.

## Problem statement

Students often know the career they want but do not know which skills are
missing or what to learn next. Pathfinder compares a student's current profile
with the requirements of a selected career and presents a practical sequence
for building evidence through projects.

## Project objective

The project demonstrates a structured AI-agent workflow rather than a simple
chatbot:

1. Analyze the student profile.
2. Analyze the target-career requirements.
3. Compare current skills with those requirements.
4. Identify skill gaps.
5. Prioritize the missing skills.
6. Create an adaptive learning sequence.
7. Recommend practical projects.
8. Present a personalized career-development plan.

## Features

- Student profile form with validation.
- Multi-entry current skills input.
- Six career tracks plus a custom-career option.
- Beginner, intermediate, and advanced experience levels.
- Roadmaps adapted to available weekly learning time.
- Visible processing screen that explains each agent step.
- Results dashboard with strengths, skill gaps, priorities, readiness estimate,
  projects, weekly roadmap, and AI recommendations.
- Friendly empty, validation, and error states.
- Browser persistence through local storage.
- Edit-profile and start-over actions.
- Responsive layout for classroom demos and smaller screens.

## Technologies used

- React
- TypeScript
- Vite
- Wouter
- Tailwind CSS
- Lucide React
- Framer Motion

## AI Agent workflow

The workspace build uses a server-side Gemini request. The browser submits the
student profile to the API server, and the server sends the profile to Gemini
with a structured JSON response schema. The server validates the returned
roadmap before the dashboard displays it. The Gemini key is never sent to the
browser.

## How the application works

1. Open the Pathfinder home page.
2. Select **Create My Career Roadmap**.
3. Enter the student's name, degree or branch, current skills, projects,
   career, experience level, and available learning time.
4. Select **Generate My Roadmap**.
5. Follow the visible agent-processing sequence.
6. Review strengths, skill gaps, priority skills, recommended projects, and the
   personalized roadmap on the results dashboard.

The readiness value is an indicative assessment generated for planning. It is
not an official, scientific, or guaranteed career score.

## Configuration

Add the key as a Replit Secret named:

```text
GEMINI_API_KEY
```

The server reads this key only at request time. Do not add it to frontend
files, source control, or chat messages.

## Run the project

From the repository root:

```bash
pnpm --filter @workspace/student-career-roadmap run dev
```

The managed artifact workflow supplies the required `PORT` and `BASE_PATH`
values. The app is available at the `/career-roadmap/` preview path.

## Test the project

Run the typecheck:

```bash
pnpm --filter @workspace/student-career-roadmap run typecheck
```

Try at least five profiles using these careers:

- Data Analyst
- Full-Stack Developer
- AI/ML Engineer
- Cloud Engineer
- Cybersecurity Analyst

Use different current skills and experience levels for each profile. Confirm
that the career requirements, skill gaps, priority list, projects, and roadmap
change with the submitted inputs.

## Preparing for publishing on Replit

Before publishing:

1. Add `GEMINI_API_KEY` through Replit Secrets.
2. Verify structured-response validation and friendly provider-error handling.
3. Run the typecheck and production build.
4. Test the full flow in the Replit preview.
5. Review the artifact's preview path and managed workflow.
6. Publish only after the live provider flow has been verified.