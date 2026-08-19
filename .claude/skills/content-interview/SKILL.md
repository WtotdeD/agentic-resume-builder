---
name: content-interview
description: Interviews the user about a job experience, achievement, showcase project, or community contribution, then produces a properly formatted markdown file for the content vault (content/). Use when the user wants to add career content to their resume.
argument-hint: [experience | showcase | project] [optional: brief description]
---

# Content Interview

Interview the user to produce content for the resume vault. The argument `$ARGUMENTS` may specify the content type and a brief description (e.g., "experience my role at Hyperion" or "showcase my workflow-api repo").

## Phase 0: Determine content type

If `$ARGUMENTS` specifies the type, use it. Otherwise ask:

> What are we capturing?
> 1. **Experience** — a job role (produces `content/experience/{id}.md`)
> 2. **Showcase** — a repo or side project you want to demo (appends to `content/showcases.md`)
> 3. **Project** — a notable project or community contribution (appends to `content/projects.md`)

Do not proceed until the type is clear.

## Phase 0b: Detect existing content (extend mode)

After determining the content type, check whether an entry already exists:

- **Experience**: Search `content/experience/*.md` for a file matching the company name or description from `$ARGUMENTS`. Read the file.
- **Showcase**: Search `content/showcases.md` for a matching `## {Name}` or `id:` entry. Read the relevant section.
- **Project**: Search `content/projects.md` for a matching `## {Name}` entry.

**If existing content is found:**

1. Present a summary to the user:
   > I found an existing entry for **{name}** in `{file path}`:
   > - **Narrative:** {sentence count} sentences, {paragraph count} paragraphs
   > - **Sections:** {list of ## headings with bullet counts, e.g., "Achievements (6), Leadership & Mentoring (3)"}
   > - **Technologies:** {count} listed
   >
   > Do you want to **extend** this entry (add sections, fill gaps, add bullets) or **start a new entry** (e.g., a different role at the same company)?

2. If the user chooses **extend**, proceed to Phase 1 in extend mode (gap-filling questions).
3. If the user chooses **start new**, proceed to Phase 1 as normal (full interview).

**If no existing content is found:** proceed to Phase 1 as normal.

## Phase 1: Interview

Ask questions **in rounds of 3-5**, not all at once and not one at a time. Wait for answers before the next round. Tailor questions to the content type.

The goal is to extract concrete, specific, quantifiable content — not generic descriptions. Push for numbers, outcomes, and before/after comparisons. If the user gives vague answers ("improved the platform"), follow up: "Improved how? Faster? Cheaper? More reliable? By how much?"

### For Experience

**Round 1 — Context:**
- Company name, your job title, location?
- When did you start? When did you leave (or still there)?
- What was the state of things when you arrived? What problem were you hired to solve?

**Round 2 — What you did:**
- What were the 2-3 biggest things you built, fixed, or changed?
- What technologies did you use day-to-day?
- Did you lead, mentor, or architect — or primarily build?

**Round 3 — Impact (push hard here):**
- For each thing you mentioned: what changed because of it? Numbers?
- What would have happened if you hadn't done this?
- Anything you're proud of that doesn't fit neatly into a metric?

**Round 4 — Leadership, mentoring & community:**
- Did you teach, mentor, or coach anyone? Formally or informally? How many people?
- Did you bridge teams, departments, or skill gaps? What did that look like?
- Any community contributions — talks, publications, crowdfunding, open source, events?
- Skip this round if the role was purely individual contributor with no mentoring/community angle.

**Optional Round 5 — if the answers are rich enough to warrant it:**
- Anything that makes this role unusual or memorable?
- What did you learn here that you still carry?

### For Experience (extend mode)

When extending an existing entry, skip context questions (company, title, dates, technologies) — you already have them. Instead, focus on gaps:

**Round 1 — Gap analysis (present, don't ask):**
- Review which `##` sections exist and which are thin or missing
- Check which profile angles (tech lead, GCP, AWS, Azure, startup) lack supporting content in this entry
- Tell the user: "Your {company} entry has strong {sections}, but I see gaps in {missing areas}. Let's fill those."

**Round 2 — Targeted questions (based on gaps):**
- For missing sections: ask directly about that angle. E.g., if no `## GCP & Cross-Cloud` section exists: "Did this role involve any GCP or cross-cloud integration work?"
- For thin sections (1 bullet): "You have {N} bullet under {section}. Any more outcomes we should capture?"
- For over-populated sections (>3 Achievements, >2 other): flag them for trimming: "Your {section} has {N} bullets — the target is {max}. Want to trim to the strongest?"
- For profile angles: "For the {profile} resume, it would help to have content about {specific area}. Can you tell me about that?"

**Round 3 — Impact (same push for specifics as the full interview):**
- For each new item: quantify. "How much? How many? What changed?"

### For Showcase

**Round 1 — What is it:**
- Repo URL?
- One-sentence summary — what does it do?
- What technologies does it use?
- Which job experience is it related to (if any)?

**Round 2 — Why it matters:**
- What problem does it solve? Why did you build it instead of using something existing?
- What 2-3 principles or mindset does it demonstrate? (e.g., "modularity", "cost-awareness", "testability")
- For each principle: one concrete example from the code.

If a repo URL is provided, read the README (via WebFetch) to ground the interview in what actually exists.

### For Project

**Round 1 — What is it:**
- Project name?
- One-line description — what did it do?
- URL (if public)?
- Technologies used?

**Round 2 — Highlights:**
- What were the 1-3 most notable outcomes or highlights?
- Any metrics (users, performance, adoption)?

## Phase 2: Draft

**For new entries:** Write the content file in the exact format from the spec. Present it to the user in a code block for review.

**For extend mode:** Draft only the additions — new `##` sections, additional bullets under existing sections, or narrative expansion. Present the additions clearly, showing where they slot into the existing file. Never remove or rewrite existing content unless the user explicitly asks. Format additions as:

> **New section to add after `## {existing section}`:**
> ```markdown
> ## {New Section}
>
> - {bullet} — {context}
> ```
>
> **Additional bullets for `## {existing section}`:**
> ```markdown
> - {new bullet} — {context}
> ```

### Experience file format

```markdown
---
id: {company-slug}-{role-slug}
company: {Company Name}
title: {Job Title}
location: {City, Country}
start: {YYYY-MM}
end: {YYYY-MM or omit for current}
draft: false
technologies:
  - {Tech 1}
  - {Tech 2}
---

{2-4 sentence narrative paragraph. Concrete and specific. Starts with
what the role was about, then the most impactful things done. Weave in
quantified outcomes naturally — don't list them, narrate them.}

## Achievements

- {metric} — {context}
- {metric} — {context}
- {metric} — {context (3 max)}

## Leadership & Mentoring

- {what you did} — {who benefited, how many, what changed}
- {what you did} — {impact (2 max per section)}
```

Rules for the narrative:
- Write in past tense for completed roles, present tense for current
- Lead with the strongest verb: "Took ownership", "Redesigned", "Built", "Led"
- No buzzwords ("leveraged", "synergized", "cutting-edge") — use plain engineering language
- Bold key metrics inline with `**metric**` when they appear in the narrative
- 2-4 sentences max — this is a summary, not a cover letter

Rules for achievements:
- Format: `- {quantified result} — {what you did to achieve it}`
- Lead with the number or outcome, not the action
- **3 bullets max.** Pick the strongest, most quantifiable outcomes. If the user gave more, ruthlessly cut — a resume is a highlight reel, not a changelog
- If the user couldn't quantify something, use qualitative impact ("Zero documentation debt", "Days to hours")

Rules for additional sections:
- Only include sections that have real content — don't force empty sections
- **Use a heading from the vault's fixed vocabulary**, or the section will not
  render. A resume config selects sections by *exact* heading name and silently
  omits anything it does not list. The current vocabulary is:
  `Achievements`, `Architecture`, `Leadership & Mentoring`, `Data Quality`,
  `Cost & Efficiency`, `Community`.
- Introducing a genuinely new heading is allowed, but it renders nowhere until
  you add the exact name to a config's `sections:` list. Tell the user this
  explicitly — there is no error or warning when a heading matches nothing.
- Same bullet format as achievements: `- {what} — {impact/context}`
- **2 bullets max per section.** Each bullet must be dense and high-impact. Recruiters scan, they don't read — fewer strong bullets beat many average ones
- The resume config YAML controls which sections render per audience

### Showcase entry format (appended to content/showcases.md)

```markdown
## {Project Name}
id: {slug}
repo: {URL}
technologies: {comma-separated}
related_experience: {experience-id, if applicable}

{1-2 sentence summary of what the repo does and why it exists.}

### Highlights

- {Principle} — {concrete example}
- {Principle} — {concrete example}
- {Principle} — {concrete example}
```

### Project entry format (appended to content/projects.md)

```markdown
## {Project Name}
description: {one-line description}
url: {URL if public}
technologies: {comma-separated}
highlights: {highlight 1} | {highlight 2} | {highlight 3}
```

## Phase 3: Refine

After presenting the draft:
1. Ask the user to review — anything wrong, missing, or overstated?
2. Iterate once or twice if needed
3. Do NOT over-polish — the user can refine in their IDE later

## Phase 4: Save

**For new entries:**
- **Experience**: Write to `content/experience/{id}.md` with `draft: false` so it
  renders immediately. If the user prefers to stage it, set `draft: true` — but
  say clearly that a draft entry is invisible in every resume until flipped, and
  that a vault of drafts renders an empty resume.
- **Showcase**: Append to `content/showcases.md` (create if it doesn't exist).
- **Project**: Append to `content/projects.md` (create if it doesn't exist).

**Always, after writing any entry:** compare the technologies just captured
against `content/skills.md`. Anything missing is invisible in the Skills section,
because nothing derives skills from entry frontmatter. Either add it to the right
category or ask the user which category it belongs in.

**For extend mode:**
- **Experience**: Edit the existing file — append new sections at the appropriate position, add bullets to existing sections. Do not modify frontmatter, narrative, or existing bullets unless the user explicitly asked.
- **Showcase/Project**: Edit the existing entry in the shared file.
- If a `.nl.md` counterpart exists, remind the user: "Don't forget to update the Dutch version at `{nl file path}` with the new content."

After saving, tell the user:
- Where the file was saved (or edited)
- For new experience: it is written with `draft: false`, so it appears in any
  resume config that expands or lists it
- Which resume configs they might want to update to include the new content
- For extend mode: which new `##` sections were added, so they can add them to config `experience.sections` if needed

## Rules

- **Interview, don't interrogate.** This should feel like a conversation, not a form. React to answers, follow interesting threads.
- **Push for specifics.** "Improved performance" is not content. "Reduced query time from 45s to 3s" is content. Always follow up on vague claims.
- **Don't invent.** If the user can't quantify something, don't make up numbers. Use qualitative framing instead.
- **Respect the format.** The output must match the spec exactly — the content vault parser will reject malformed files.
- **Short and punchy.** Resume content should be dense. Every word earns its place. Cut filler ruthlessly in the draft.

## Red flags

- Writing generic, interchangeable descriptions that could apply to any engineer
- Accepting "improved" without asking "by how much?"
- Drafting more than 4 sentences in the narrative
- Skipping the impact round
- Adding achievements the user didn't actually mention
