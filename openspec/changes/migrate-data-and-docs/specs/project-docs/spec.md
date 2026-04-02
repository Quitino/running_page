## ADDED Requirements

### Requirement: Create codebase reading notes
The system SHALL provide a comprehensive codebase analysis document at `note/codebase-notes.md` covering project architecture, directory structure, data flow, Python backend, React frontend, and GitHub Actions.

#### Scenario: Notes document exists and is comprehensive
- **WHEN** user reads note/codebase-notes.md
- **THEN** the document contains ASCII diagrams, data flow illustrations, component hierarchy, and module descriptions based on the latest code version

### Requirement: Create deployment guide
The system SHALL provide a deployment flow document at `note/deployment-guide.md` explaining the end-to-end GitHub Actions pipeline from data sync to GitHub Pages deployment.

#### Scenario: Guide covers full deployment chain
- **WHEN** user reads note/deployment-guide.md
- **THEN** the document explains trigger conditions, sync job flow, build job flow, Pages deployment, required permissions, and alternative deployment methods (Vercel, Docker)

### Requirement: Create upstream sync tutorial
The system SHALL provide a tutorial at `note/upstream-sync-tutorial.md` explaining how to sync updates from yihong0618/running_page to the user's fork.

#### Scenario: Tutorial covers complete sync workflow
- **WHEN** user follows the upstream sync tutorial
- **THEN** the document covers git remote setup, fetch/merge/push commands, conflict resolution strategies for common files, and best practices
