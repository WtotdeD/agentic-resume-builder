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

## Phase 0c: Read the lenses before you interview

**Do this for every experience interview, new or extend.** It is what turns one
job into several resumes.

Read every file in `resumes/` and build a table of lens name against its
`experience.sections` list. Do not work from a remembered list of profiles —
lenses are added and renamed, and a hardcoded list goes stale silently.

```
lens                     sections it selects
tech-lead                Achievements, Leadership & Mentoring, Architecture
aws-data-engineer        Achievements, Architecture, Cost & Efficiency
...
```

Two things come out of this table:

- **The union of all `sections:` values** is the set of angles worth asking
  about. A section no lens selects renders nowhere, so there is no point
  collecting it. A section several lenses want is worth pushing hardest on.
- **Which lenses are hungry.** A lens whose sections are unsupported by any
  entry it expands renders a thin resume, and nothing warns anyone.

One role legitimately serves every lens. In this vault `hyperion-tech-lead` is
expanded by all five: the AWS lens takes its Architecture and Cost & Efficiency,
the tech-lead lens takes its Leadership & Mentoring, the GCP lens takes its Data
Quality. Same job, same file, different faces. That only works because the
interview collected all of those angles — so collect them.

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

**Round 4 — One pass per angle the lenses actually want:**

Work through the section union from Phase 0c. For each angle not already covered
by earlier answers, ask directly. The point is that a single role usually has
material for most of them, and the user will not volunteer it unasked — they
describe their job the way they think about it, not the way five audiences do.

- **Architecture** — what did you design, and what shape did the system end up?
  What decision would you defend in an interview?
- **Leadership & Mentoring** — did you teach, coach or mentor anyone, formally or
  otherwise? How many people, and what changed for them? Did you bridge teams or
  skill gaps?
- **Cost & Efficiency** — did anything get cheaper, faster, or need less
  operational effort? By how much?
- **Data Quality** — did correctness, freshness, or trust in the data improve?
  What was breaking before?
- **Community** — talks, publications, open source, events, internal guilds?
  A package you released counts, and so does one nobody starred.

Ask about an angle even when it seems unlikely. "No, nothing there" is a fast
answer and a cheap question; the expensive outcome is a lens that renders thin
because nobody thought to ask.

Skip an angle only when no lens selects it.

**Optional Round 5 — if the answers are rich enough to warrant it:**
- Anything that makes this role unusual or memorable?
- What did you learn here that you still carry?

### For Experience (extend mode)

When extending an existing entry, skip context questions (company, title, dates, technologies) — you already have them. Instead, focus on gaps:

**Round 1 — Gap analysis (present, don't ask):**
- Review which `##` sections exist and which are thin or missing
- Using the lens table from Phase 0c, check which lenses expand this entry and which of their sections it does not supply
- Tell the user: "Your {company} entry has strong {sections}, but I see gaps in {missing areas}. Let's fill those."

**Round 2 — Targeted questions (based on gaps):**
- For missing sections: ask directly about that angle, naming a heading from the
  fixed vocabulary. E.g. if the entry has no `## Data Quality` and two lenses
  select that section: "Both the GCP and Azure resumes want a Data Quality angle
  on this role — did correctness or freshness improve while you were there?"
  Never invent a heading such as `## GCP & Cross-Cloud`; a heading outside the
  vocabulary renders nowhere and says nothing about it.
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

Then close the loop against the lens table from Phase 0c, because an entry
nothing expands is an entry nobody reads. For each lens, say plainly which of the
sections just written it would select, and therefore whether the new id belongs
in its `expand:` list:

> `tech-lead` selects Achievements, Leadership & Mentoring, Architecture — this
> entry has all three. Add `{id}` to its `expand:` list.
> `gcp-data-engineer` selects Data Quality, which this entry does not have.
> Expanding it there would render the role with an Achievements section only.

Offer to make those edits. Then, and this matters more than anything else in this
skill:

> Open `/render/{lens}` for each config you changed and confirm the sections are
> actually on the page.

A `sections:` heading that matches nothing produces no error, no warning and no
log line. `pnpm validate` passes. The integration test in
`tests/integration/lenses.test.ts` cannot catch it either — it only checks that a
heading an expanded entry *provides* survives assembly, so a heading that matches
nothing anywhere is invisible to it by construction. Looking at the page is the
only verification that exists.

For extend mode: name the new `##` sections explicitly, so the user can add them
to the `experience.sections` of any lens that should show them.

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
