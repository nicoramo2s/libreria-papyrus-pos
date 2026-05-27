# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

## Active Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| branch-pr | Creating a pull request, opening a PR, or preparing changes for review | PR creation workflow for Agent Teams Lite following the issue-first enforcement system. |
| find-skills | "how do I do X", "find a skill for X", "is there a skill that can...", expressing interest in extending capabilities | Helps users discover and install agent skills. |
| frontend-design | building web components, pages, artifacts, posters, or applications; styling/beautifying web UI | Create distinctive, production-grade frontend interfaces with high design quality. |
| go-testing | writing Go tests, using teatest, or adding test coverage | Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing. |
| issue-creation | creating a GitHub issue, reporting a bug, or requesting a feature | Issue creation workflow for Agent Teams Lite following the issue-first enforcement system. |
| judgment-day | "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | Parallel adversarial review protocol that launches two independent blind judge sub-agents. |
| skill-creator | creating a new skill, adding agent instructions, or documenting patterns for AI | Creates new AI agent skills following the Agent Skills spec. |
| skill-registry | "update skills", "skill registry", "actualizar skills", "update registry" | Create or update the skill registry for the current project. |

## Project Conventions
- No agent instruction files found (no CLAUDE.md, AGENTS.md, .cursorrules, GEMINI.md, copilot-instructions.md)
- Project has `.atl/` directory with SDD exploration artifacts
