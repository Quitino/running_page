## 1. 数据文件迁移

- [x] 1.1 复制 GPX 文件: `cp running_page_me/GPX_OUT/*.gpx GPX_OUT/` (303 files)
- [x] 1.2 复制 TCX 文件: `cp running_page_me/TCX_OUT/*.tcx TCX_OUT/` (207 files)
- [x] 1.3 复制 SQLite 数据库: `cp running_page_me/run_page/data.db run_page/data.db` (648KB)
- [x] 1.4 复制已导入文件列表: `cp running_page_me/imported.json imported.json`

## 2. 前端配置

- [x] 2.1 修改 `src/static/site-metadata.ts`: 站点标题改为"路古在路上"，URL、导航链接已更新
- [x] 2.2 检查 `src/utils/const.ts`: IS_CHINESE=true 已正确，MAP_TILE_VENDOR='mapcn' 免费底图，无需调整

## 3. GitHub Actions 工作流配置

- [x] 3.1 修改 `.github/workflows/run_data_sync.yml` 环境变量：RUN_TYPE=garmin_cn, ATHLETE, TITLE, MIN_GRID_DISTANCE=5, IGNORE ranges=5
- [x] 3.2 BIRTHDAY_MONTH 设为 1994-02

## 4. 重新生成数据文件

- [x] 4.1 安装 Python 依赖: pip install 成功
- [x] 4.2 从 data.db 重新生成 activities.json: 308 条活动 (2018-2025)
- [x] 4.3 生成 SVG 海报: github.svg (299KB), grid.svg (2.1MB), circular year SVGs 已生成
- [x] 4.4 验证 activities.json 包含个人数据 ✓ (308条, 非原作者3516条)

## 5. 文档编写

- [x] 5.1 创建 `note/` 目录
- [x] 5.2 编写 `note/codebase-notes.md` — 完成（含架构图、数据流、组件层级、模块说明）
- [x] 5.3 编写 `note/deployment-guide.md` — 完成（含部署链路、触发条件、Secrets配置、故障排查）
- [x] 5.4 编写 `note/upstream-sync-tutorial.md` — 完成（含fetch/merge流程、冲突处理、多账号配置）

## 6. 推送到远程并验证

- [ ] 6.1 Git add 所有变更的数据文件和配置文件
- [ ] 6.2 Git commit 并推送到 origin master
- [ ] 6.3 在 GitHub 仓库 Settings → Secrets 中添加 GARMIN_SECRET_STRING_CN
- [ ] 6.4 在 GitHub 仓库 Settings → Pages 中设置 Source 为 "GitHub Actions"
- [ ] 6.5 手动触发 Actions 工作流或等待自动触发，验证构建部署成功
- [ ] 6.6 访问 https://quitino.github.io/running_page/ 确认页面正常显示个人数据
