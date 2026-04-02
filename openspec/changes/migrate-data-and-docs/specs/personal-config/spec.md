## ADDED Requirements

### Requirement: Configure site metadata
The system SHALL update `src/static/site-metadata.ts` with personal site information: title "路古在路上", URL, logo, and navigation links.

#### Scenario: Site metadata updated
- **WHEN** site-metadata.ts is modified
- **THEN** the site title displays "路古在路上" and navigation links point to user's personal pages

### Requirement: Configure GitHub Actions workflow
The system SHALL update `.github/workflows/run_data_sync.yml` environment variables to use personal Garmin CN sync configuration.

#### Scenario: Workflow configured for Garmin CN
- **WHEN** run_data_sync.yml env section is updated
- **THEN** RUN_TYPE=garmin_cn, ATHLETE="slow is smooth, smooth is fast", TITLE="Quitino", MIN_GRID_DISTANCE=5, TITLE_GRID="Over 5km Runs"

### Requirement: Document GitHub Secrets setup
The change SHALL document the required GitHub Secret (GARMIN_SECRET_STRING_CN) and GitHub Pages settings that the user MUST configure manually.

#### Scenario: User follows setup instructions
- **WHEN** user configures GARMIN_SECRET_STRING_CN in GitHub Settings → Secrets → Actions
- **AND** sets Pages source to "GitHub Actions"
- **THEN** the daily cron job successfully syncs data and deploys the site
