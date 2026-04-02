## ADDED Requirements

### Requirement: Migrate GPX and TCX data files
The system SHALL copy all GPX files from `running_page_me/GPX_OUT/` to `GPX_OUT/` and all TCX files from `running_page_me/TCX_OUT/` to `TCX_OUT/`.

#### Scenario: GPX files migrated
- **WHEN** migration script copies GPX_OUT directory
- **THEN** all 303 GPX files exist in `GPX_OUT/` with identical content to source

#### Scenario: TCX files migrated
- **WHEN** migration script copies TCX_OUT directory
- **THEN** all 207 TCX files exist in `TCX_OUT/` with identical content to source

### Requirement: Migrate SQLite database
The system SHALL copy `running_page_me/run_page/data.db` to `run_page/data.db`.

#### Scenario: Database migrated
- **WHEN** data.db is copied to new location
- **THEN** `run_page/data.db` exists and contains all historical activity records

### Requirement: Migrate imported file list
The system SHALL copy `running_page_me/imported.json` to `imported.json` in the project root.

#### Scenario: Imported list preserved
- **WHEN** imported.json is copied
- **THEN** subsequent sync operations SHALL not re-import already processed files

### Requirement: Regenerate activities.json
The system SHALL regenerate `src/static/activities.json` from the migrated `data.db` using the new version's Python scripts.

#### Scenario: Activities JSON regenerated
- **WHEN** Python sync/generation script runs against migrated data.db
- **THEN** `src/static/activities.json` contains all activities in the format expected by the new frontend code

### Requirement: Regenerate SVG assets
The system SHALL regenerate SVG poster files in `assets/` from the migrated data.

#### Scenario: SVG assets regenerated
- **WHEN** gen_svg.py runs against migrated data
- **THEN** `assets/github.svg`, `assets/grid.svg`, and yearly circular SVGs are generated
