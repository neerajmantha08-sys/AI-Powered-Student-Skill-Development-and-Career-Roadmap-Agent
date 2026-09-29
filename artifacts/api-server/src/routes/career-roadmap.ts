import { Router, type IRouter } from "express";
import {
  GenerateCareerRoadmapBody,
  GenerateCareerRoadmapResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    career: { type: "STRING" },
    requirements: { type: "ARRAY", items: { type: "STRING" } },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    gaps: { type: "ARRAY", items: { type: "STRING" } },
    priorities: { type: "ARRAY", items: { type: "STRING" } },
    readiness: { type: "INTEGER" },
    projects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          skills: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["title", "description", "skills"],
      },
    },
    roadmap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          week: { type: "STRING" },
          focus: { type: "STRING" },
          outcome: { type: "STRING" },
        },
        required: ["week", "focus", "outcome"],
      },
    },
    recommendation: { type: "STRING" },
  },
  required: [
    "career",
    "requirements",
    "strengths",
    "gaps",
    "priorities",
    "readiness",
    "projects",
    "roadmap",
    "recommendation",
  ],
} as const;

function buildPrompt(input: typeof GenerateCareerRoadmapBody._type): string {
  const selectedCareer =
    input.career === "Custom" ? input.customCareer || "Custom technology path" : input.career;

  return `You are the planning engine inside Pathfinder, a student career-development project.
Create a realistic, encouraging, and specific career-development plan for this student.
This is not guaranteed career advice. Use only the information in the profile and your general knowledge of the selected career. Do not invent salary data, job-market statistics, or credentials.

STUDENT PROFILE
- Name: ${input.name}
- Degree / branch: ${input.degree}
- Current skills: ${input.skills.length ? input.skills.join(", ") : "No current skills listed"}
- Existing projects: ${input.projects || "No projects listed"}
- Target career: ${selectedCareer}
- Experience level: ${input.experience}
- Available learning time: ${input.learningTime}

WORKFLOW
1. Analyze the student's current profile, including their skills, projects, experience, degree, and time.
2. Determine the important skills associated with the target career.
3. Compare current skills and project evidence with those requirements.
4. Identify the student's skill gaps.
5. Prioritize the gaps in a sensible order, putting prerequisites before advanced topics.
6. Create a learning roadmap that fits the available weekly time.
7. Recommend practical projects that develop and demonstrate the prioritized skills.
8. Write a concise final personalized plan.

Return only valid JSON matching the requested schema. Use short, student-friendly strings. Include 5–8 career requirements, 3–6 prioritized gaps when possible, 2–3 practical projects, and 4–8 roadmap steps. Keep readiness between 0 and 100 and describe it as an indicative assessment in the recommendation. If the target career is custom, state in the recommendation that the baseline should be validated against real job descriptions.`;
}

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return "";

  return candidates
    .map((candidate) => {
      if (!candidate || typeof candidate !== "object") return "";
      const content = (candidate as { content?: unknown }).content;
      if (!content || typeof content !== "object") return "";
      const parts = (content as { parts?: unknown }).parts;
      if (!Array.isArray(parts)) return "";
      return parts
        .map((part) =>
          part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string"
            ? (part as { text: string }).text
            : "",
        )
        .join("");
    })
    .join("")
    .trim();
}

function parseModelJson(text: string): unknown {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

router.post("/career-roadmap/generate", async (req, res): Promise<void> => {
  const parsed = GenerateCareerRoadmapBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid career roadmap profile");
    res.status(400).json({ error: "Please complete the required student profile fields." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    req.log.error("GEMINI_API_KEY is not configured");
    res.status(502).json({ error: "The AI service is not configured yet. Please try again later." });
    return;
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(parsed.data) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.35,
          maxOutputTokens: 8192,
        },
      }),
    });

    const payload: unknown = await response.json();
    if (!response.ok) {
      req.log.error({ status: response.status }, "Gemini roadmap request failed");
      res.status(502).json({ error: "Unable to generate the roadmap right now. Please try again." });
      return;
    }

    const text = extractText(payload);
    if (!text) {
      req.log.error("Gemini returned an empty roadmap response");
      res.status(502).json({ error: "The AI returned an empty plan. Please try again." });
      return;
    }

    let result: unknown;
    try {
      result = parseModelJson(text);
    } catch {
      req.log.error("Gemini returned non-JSON roadmap content");
      res.status(502).json({ error: "The AI returned an unexpected plan format. Please try again." });
      return;
    }

    const validated = GenerateCareerRoadmapResponse.safeParse(result);
    if (!validated.success) {
      req.log.error({ errors: validated.error.flatten() }, "Gemini roadmap response failed validation");
      res.status(502).json({ error: "The AI returned an incomplete plan. Please try again." });
      return;
    }

    res.json(validated.data);
  } catch (error) {
    req.log.error({ err: error }, "Unexpected Gemini roadmap error");
    res.status(502).json({ error: "Unable to generate the roadmap right now. Please check your connection and try again." });
  }
});

export default router;