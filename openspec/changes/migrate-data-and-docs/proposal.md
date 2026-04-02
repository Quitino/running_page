## Why

将旧仓库 (`running_page_me/`) 中的个人跑步数据迁移到新 fork 的代码库中，配置个性化信息，使 GitHub Actions 能自动同步 Garmin 数据并部署到 GitHub Pages。同时编写详细的项目代码阅读笔记、部署流程文档和上游同步教程，方便后续维护。

## What Changes

- 从 `running_page_me/` 迁移数据文件到当前项目：GPX_OUT (303文件), TCX_OUT (207文件), data.db, imported.json, activities.json, SVG assets
- 修改前端配置 `src/static/site-metadata.ts`：站点标题 "路古在路上"、URL、导航链接
- 修改 GitHub Actions 工作流 `.github/workflows/run_data_sync.yml`：RUN_TYPE=garmin_cn, ATHLETE, TITLE, GITHUB_NAME 等环境变量
- 编写三份文档保存到 `note/` 目录：
  1. `codebase-notes.md` — 项目代码架构阅读笔记（图文结合）
  2. `deployment-guide.md` — GitHub Pages 部署流程文档（图文结合）
  3. `upstream-sync-tutorial.md` — 从上游仓库同步更新教程（图文结合）

## Capabilities

### New Capabilities
- `data-migration`: 将旧项目数据（GPX/TCX/DB/JSON/SVG）迁移到新代码库
- `personal-config`: 配置个人站点信息、工作流环境变量、GitHub Secrets
- `project-docs`: 编写代码阅读笔记、部署指南、上游同步教程

### Modified Capabilities
<!-- 无需修改现有 spec -->

## Impact

- **数据文件**: GPX_OUT/, TCX_OUT/, run_page/data.db, src/static/activities.json, imported.json, assets/*.svg
- **前端配置**: src/static/site-metadata.ts, src/utils/const.ts (可能需要调整)
- **CI/CD**: .github/workflows/run_data_sync.yml (环境变量)
- **GitHub 设置**: 需在仓库 Settings 中配置 GARMIN_SECRET_STRING_CN Secret 和 Pages 部署源
- **文档**: note/ 目录下新增三份文档
