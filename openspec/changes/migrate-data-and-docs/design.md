## Context

当前状态：
- 新 fork 代码在 `/mnt/data2/nature_topo_data/run_page_v2/running_page/`，数据目录（GPX_OUT, TCX_OUT等）为空
- 旧数据在 `running_page_me/` 子目录，包含 307 条活动记录、303 个 GPX 文件、207 个 TCX 文件、SQLite 数据库、SVG 海报
- 新代码版本较旧代码有升级：Tailwind CSS v4、Vite 7、ESLint 9 flat config、新增 intervals.icu 同步等
- Git remote 已配置：origin → Quitino/running_page, upstream → yihong0618/running_page
- 旧仓库已有的 note/ 目录包含之前生成的文档（基于旧代码版本），需要基于新代码重新编写

## Goals / Non-Goals

**Goals:**
- 将旧数据完整迁移到新项目目录，确保 GitHub Actions 同步和 Pages 部署正常工作
- 配置个人信息（站点元数据、工作流环境变量）
- 编写基于最新代码的详细文档（代码笔记、部署指南、同步教程）
- 推送到远程仓库使 GitHub Pages 生效

**Non-Goals:**
- 不修改项目核心代码（组件、Python 脚本）
- 不添加新功能或修复原项目 bug
- 不更换地图供应商或颜色主题（保持默认即可）
- 不处理 Garmin Secret 的生成（用户需自行在 GitHub Settings 中配置）

## Decisions

### 1. 数据迁移策略：直接复制文件

**选择**: 从 `running_page_me/` 直接复制数据文件到对应目录  
**替代方案**: 重新从 Garmin 同步所有数据  
**理由**: 直接复制最快且保留完整历史数据。GitHub Actions 首次运行时会增量同步新数据。

需要复制的文件清单：
```
running_page_me/GPX_OUT/*          →  GPX_OUT/
running_page_me/TCX_OUT/*          →  TCX_OUT/
running_page_me/run_page/data.db   →  run_page/data.db
running_page_me/imported.json      →  imported.json
```

**不需要复制的文件**：
- `src/static/activities.json` — 新代码已包含原作者的数据，迁移后需通过 Python 脚本从 data.db 重新生成
- `assets/*.svg` — 迁移后需通过 gen_svg.py 重新生成
- 旧代码文件（package.json, vite.config.ts 等）— 使用新版本

### 2. activities.json 重新生成

**选择**: 复制 data.db 后，本地运行 Python 脚本重新生成 activities.json  
**理由**: 新版本的 Generator 可能有新字段（如 elevation_gain、subtype），重新生成确保数据格式兼容

### 3. 文档位置

**选择**: 放在项目根目录 `note/` 文件夹  
**理由**: 与旧项目保持一致，不污染项目源代码目录

### 4. 工作流配置

**选择**: 直接修改 `run_data_sync.yml` 中的环境变量  
**理由**: 这是项目预设的配置方式，与旧配置一致

需要修改的变量：
| 变量 | 旧值(默认) | 新值 |
|------|-----------|------|
| RUN_TYPE | pass | garmin_cn |
| ATHLETE | yihong0618 | slow is smooth, smooth is fast |
| TITLE | Yihong0618 Running | Quitino |
| MIN_GRID_DISTANCE | 10 | 5 |
| TITLE_GRID | Over 10km Runs | Over 5km Runs |
| IGNORE_START_END_RANGE | 10 | 5 |
| IGNORE_RANGE | 10 | 5 |
| BIRTHDAY_MONTH | 1989-03 | (需用户提供) |

### 5. site-metadata.ts 配置

从旧版复制个人配置，但需要适配新版代码格式（新版有 `getBasePath()` 函数）。

## Risks / Trade-offs

- **data.db schema 不兼容** → 新版可能增加了字段（如 elevation_gain, subtype）。迁移后首次 sync 会自动升级 schema（SQLAlchemy 的 `create_all` 只添加缺失的表，不会自动添加列）。如果出问题，可删除 data.db 从 GPX/TCX 文件重新导入。
- **activities.json 格式变化** → 新版前端期望的字段可能与旧版不同。通过本地重新生成解决。
- **GitHub Secrets 未配置** → 推送代码后 Actions 会因缺少 GARMIN_SECRET_STRING_CN 失败。需要用户手动在 GitHub Settings → Secrets 中添加。
- **GitHub Pages 未启用** → 需要用户在 Settings → Pages 中设置 Source 为 "GitHub Actions"。
