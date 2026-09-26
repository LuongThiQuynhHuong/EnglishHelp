# English Helper agent guide

## Project ownership

- `MobileApp/` contains the current mobile application.
- `Network/` is reserved for network-related development.
- `WebApp/` is reserved for web application development.

Work in the project that owns the change. For work spanning projects, identify the affected interfaces and coordinate changes across their owners.

## Instruction routing

Before changing a project, read its `AI/README.md` and the instruction files it names for the task. Read the `AI/README.md` of every affected project for cross-project work. Keep project-specific rules in that project's `AI/` folder; keep this file limited to rules shared by all three projects.

## Shared rules

- Follow the existing project structure and documented decisions. Do not assume a stack or architecture for a project that has not chosen one.
- Keep changes within the requested scope, and document any new cross-project contract in the affected projects.
- Run the checks documented by each affected project when changing its code, and report checks that could not run.
- Update the owning project's README and AI instructions when its architecture, dependencies, or workflow changes. Update the root README only for project-wide information.
