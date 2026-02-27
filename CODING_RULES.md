# Coding Rules & Guidelines

## Core Philosophy
- Write minimal, production-ready code
- Prioritize performance and readability
- No comments unless explicitly requested
- No placeholder logic
- No defensive over-engineering
- No speculative fallbacks
- No unused variables, imports, or functions

## Code Optimization Rules
- Use the shortest correct solution
- Avoid unnecessary loops
- Avoid nested conditionals when possible
- Use early returns
- Use built-in methods instead of manual iteration
- Avoid redundant state
- Avoid duplicate logic
- Never repeat a function — reuse or abstract

## Structure Rules
- Maximum 800 lines per file
- If approaching 600+ lines → refactor into modules
- Separate:
  - services
  - hooks
  - components
  - utils
- No business logic inside UI components
- No inline large functions inside render

## Reusability Rules
- Reuse components instead of rewriting
- Extract repeated logic into:
  - custom hooks
  - utility functions
  - shared services
- If the same code appears twice → refactor immediately

## React / React Native Rules
- Use functional components only
- Use hooks correctly
- No unnecessary re-renders
- Memoize only when needed
- Avoid inline object/array creation inside JSX
- Keep components small and focused
- Use a single source of truth for API base URL
- No duplicated API calls

## API & Backend Rules
- Centralize API config
- Never hardcode URLs inside components
- Use one API client instance
- Handle errors cleanly without excessive fallback chains
- No retry loops unless explicitly required
- No silent failures

## Performance Rules
- Avoid heavy computations in render
- No blocking synchronous loops
- Avoid unnecessary state updates
- Avoid derived state duplication
- Prefer O(n) over O(n²) always
- No premature optimization — but no inefficient patterns

## Naming & Clean Code Rules
- Use clear short names
- No vague names like data1, temp
- No overly long names
- One responsibility per function
- Functions under 40 lines ideally

## What NOT To Do
- No console.logs in production code
- No commented-out code
- No unused imports
- No mock values unless requested
- No try/catch wrapping everything
- No unnecessary optional chaining
- No empty catch blocks

## Production Standard
Write production-level code as if it is going into a high-scale SaaS product. Optimize for clarity, performance, and maintainability. Reject redundant logic automatically.
