# Repository Agent Instructions

These instructions apply to the entire repository.

## Instruction Priority

Follow instructions in this order:

1. System, developer, runtime, security, and safety instructions.
2. The user's latest explicit request.
3. This `AGENTS.md` file.
4. Instructions from an applicable skill.
5. Default agent behavior.

If a skill workflow conflicts with the no-test or no-commit rules below, the repository rules win unless the user explicitly overrides them in a later request.

## Mandatory Working Rules

### 1. Use Applicable Skills

- Before responding, asking a clarification question, inspecting files, planning, or editing code, review the skills available in the current session.
- If the user names a skill, use it.
- If a skill clearly matches the task, read its complete `SKILL.md` before taking action and follow it within the scope of the user's request.
- Use process skills before implementation or domain skills. Examples: brainstorm before creative feature work, debug systematically before fixing a bug, and process code-review feedback before applying it.
- Use the smallest set of skills that fully covers the task. Do not invoke unrelated skills.
- Announce the selected skills and their purpose in a concise commentary update.
- Do not assume that a skill used in an earlier turn remains active. Re-evaluate skills for every new request.
- Treat the runtime available-skills list as authoritative. A skill present on disk but absent from the runtime list is not available for that turn.

### 2. Prefer RTK to Reduce Token Usage

- Run `rtk --help` before the first RTK use in a new environment or when its syntax is uncertain.
- Prefer RTK wrappers whenever the required command is supported. Common choices include `rtk read`, `rtk find`, `rtk grep`, `rtk tree`, `rtk diff`, `rtk git`, `rtk deps`, `rtk err`, and `rtk summary`.
- Use the native command only when RTK does not support the operation, RTK would hide evidence required for the task, or RTK fails.
- Do not use `rtk test`, `rtk pytest`, `rtk jest`, `rtk vitest`, `rtk playwright`, or another test runner unless the user explicitly overrides the no-test rule.
- Never expose secrets through RTK or native command output. Redact passwords, tokens, connection strings, and private keys before displaying file contents.

### 3. Do Not Commit

- Do not create Git commits.
- Do not push branches or create pull requests.
- Do not stage changes unless the user explicitly asks for staging.
- Leave all changes uncommitted for the user to review and manage.
- Skills related to branch finishing, worktrees, or code review may be used only for analysis or a non-mutating handoff unless the user explicitly authorizes the relevant Git action.

### 4. Do Not Run Tests

- Do not run unit, integration, end-to-end, smoke, database-connection, browser, API, or manual runtime tests.
- Do not start the application merely to verify a change.
- Do not use a build command as an indirect test unless the user explicitly requests that build.
- Read-only static inspection is allowed: parsing configuration files, checking XML/YAML syntax without starting the application, comparing schema structure, inspecting diffs, and searching for invalid or leftover syntax.
- If a skill requires tests, adapt the workflow to static inspection or state that the test step was intentionally skipped because of this repository rule.
- Run tests only when the user gives a new, explicit instruction to do so.

### 5. Keep the API Reference Synchronized

- Every API addition, modification, or removal must update
  `docs/api-reference.md` in the same task.
- Document only implemented behavior. Keep examples, authentication,
  permissions, error codes, headers, cookies, validation constraints, request
  and response fields, and status codes synchronized with the source.
- Derive the contract from controllers, DTOs, validation annotations, security
  configuration, permission checks, cookie configuration, and error-code
  definitions.
- Never place real credentials, access tokens, refresh tokens, OAuth secrets,
  signing keys, database connection values, or personal data in API examples.

## Available Skill Catalog

The following 37 skills are currently available. Re-check the runtime catalog because availability can change between sessions.

### Core System and Skill Management — 5 Skills

- `imagegen`: Generate or edit raster images, illustrations, textures, mockups, and other bitmap assets. Use it for image creation or image editing, not for code-native SVG or HTML/CSS visuals.
- `openai-docs`: Answer current questions about OpenAI products, APIs, models, ChatGPT, or Codex using official OpenAI documentation and citations.
- `plugin-creator`: Create or update Codex plugin directories, manifests, optional plugin resources, and personal marketplace entries.
- `skill-creator`: Create or update a Codex skill, including its structure, instructions, scripts, references, and assets.
- `skill-installer`: List or install curated skills, or install skills from a GitHub repository into the Codex skills directory.

### Superpowers Workflow Skills — 14 Skills

- `superpowers:using-superpowers`: Check for applicable skills before any response or action and establish skill selection priority.
- `superpowers:brainstorming`: Clarify intent, constraints, design, and acceptance criteria before creative work, new features, components, functionality, or behavior changes.
- `superpowers:writing-plans`: Produce a concrete multi-step implementation plan when a task has a specification or requires coordinated changes across several steps.
- `superpowers:executing-plans`: Execute an existing written plan with checkpoints in a separate implementation session.
- `superpowers:systematic-debugging`: Investigate root cause, compare patterns, form a hypothesis, and verify evidence before fixing bugs, failures, or unexpected behavior.
- `superpowers:test-driven-development`: Implement features or bug fixes through red-green-refactor. This skill is available but its test execution is disabled by the repository no-test rule unless the user explicitly authorizes tests.
- `superpowers:verification-before-completion`: Require fresh evidence before claiming completion. In this repository, use read-only static verification unless the user explicitly authorizes tests.
- `superpowers:receiving-code-review`: Evaluate review feedback technically, clarify uncertain items, and apply valid feedback without blind agreement.
- `superpowers:requesting-code-review`: Request structured review after significant implementation. Do not spawn reviewers or mutate Git state unless permitted by the current runtime and user instructions.
- `superpowers:dispatching-parallel-agents`: Split two or more independent tasks across agents when parallel delegation is explicitly permitted.
- `superpowers:subagent-driven-development`: Execute an implementation plan through independent implementer and reviewer agents when multi-agent work is explicitly permitted.
- `superpowers:using-git-worktrees`: Create isolated Git worktrees for feature work when isolation is requested and Git mutations are authorized. Do not use it by default in this repository.
- `superpowers:finishing-a-development-branch`: Evaluate merge, pull-request, cleanup, and handoff options after implementation. The no-commit rule prevents commit, push, merge, or PR actions unless explicitly overridden.
- `superpowers:writing-skills`: Create, edit, and validate skill packages using the Superpowers skill-authoring workflow. Combine it with `skill-creator` when both apply.

### Frontend, Visual Design, and React Skills — 16 Skills

- `brandkit`: Generate premium brand identity boards, logo systems, guidelines, visual worlds, mockups, and identity presentations.
- `design-taste-frontend`: Default anti-generic frontend design skill for landing pages, portfolios, new interfaces, and redesigns.
- `design-taste-frontend-v1`: Use only when exact compatibility with the original v1 design-taste behavior is required; otherwise use `design-taste-frontend`.
- `gpt-taste`: Create highly art-directed frontend experiences with AIDA structure, editorial typography, bento composition, and advanced GSAP motion.
- `high-end-visual-design`: Apply premium agency-level visual standards for typography, spacing, cards, shadows, and animation while avoiding generic AI styling.
- `image-to-code`: For visually important web work, generate or inspect design references first and then implement the interface to match them closely.
- `imagegen-frontend-mobile`: Generate premium mobile application screen concepts and multi-screen flows as images only; it does not write implementation code.
- `imagegen-frontend-web`: Generate one separate horizontal design-reference image for every website section while maintaining a consistent visual system.
- `industrial-brutalist-ui`: Design raw mechanical interfaces using Swiss typography, military-terminal aesthetics, rigid grids, and utilitarian visual language.
- `minimalist-ui`: Design clean editorial interfaces with warm monochrome colors, flat bento layouts, muted accents, and restrained effects.
- `redesign-existing-projects`: Audit and upgrade an existing website or application without breaking its current functionality.
- `stitch-design-taste`: Create a semantic `DESIGN.md` for Google Stitch with typography, color, layout, motion, and performance rules.
- `vercel-composition-patterns`: Design scalable React APIs using compound components, render props, context, and composition instead of proliferating boolean props.
- `vercel-react-best-practices`: Apply Vercel's React and Next.js performance guidance to components, routing, data fetching, bundles, and rendering behavior.
- `vercel-react-view-transitions`: Implement route, shared-element, enter/exit, reorder, and directional animations using React's View Transition APIs.
- `web-design-guidelines`: Audit web UI code for accessibility, usability, responsive behavior, and general interface best practices.

### Discovery and Output Control — 2 Skills

- `find-skills`: Discover installable skills when the user asks whether a capability exists or wants to extend the agent with a new workflow.
- `full-output-enforcement`: Require complete, unabridged deliverables and prohibit placeholders, omitted sections, skeleton implementations, or token-saving shortcuts.

## Skill Selection Examples

- New backend or frontend feature: start with `superpowers:brainstorming`; use `superpowers:writing-plans` when the work spans multiple coordinated steps; then add the relevant implementation skill.
- Bug or SQL error: use `superpowers:systematic-debugging`; perform static verification only unless the user explicitly authorizes tests.
- Review feedback: use `superpowers:receiving-code-review` before changing code.
- Existing UI redesign: use `redesign-existing-projects` and select one compatible visual-direction skill.
- New React or Next.js UI: use `design-taste-frontend`, then add `vercel-react-best-practices`; add `vercel-composition-patterns` or `vercel-react-view-transitions` only when the task requires them.
- Image generation or editing: use `imagegen`; use a specialized frontend, mobile, web, or brand image skill when its scope matches more closely.
- OpenAI API or Codex question: use `openai-docs`.
- Skill creation: use `skill-creator` and `superpowers:writing-skills`.
- Plugin creation: use `plugin-creator`.
- Exhaustive file generation or conversion: use `full-output-enforcement`.
