# Running Page 部署流程文档

> 说明从数据同步到 GitHub Pages 上线的完整部署链路
> 笔记日期：2026-04-02
> 适用版本：最新 master (Vite 7 + GitHub Actions v4)

---

## 1. 部署架构概览

```
┌───────────────────────────────────────────────────────────────────┐
│                     GitHub Actions 自动化流水线                     │
│                                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐  │
│  │ 数据同步  │───→│ SVG 生成  │───→│ Git 提交  │───→│ 触发构建    │  │
│  │          │    │          │    │ + Push    │    │            │  │
│  │ Garmin   │    │ 热力图    │    │ master   │    │ gh-pages   │  │
│  │ CN API   │    │ 网格图    │    │          │    │ .yml       │  │
│  │          │    │ 圆环图    │    │          │    │            │  │
│  │          │    │ 月度生活  │    │          │    │            │  │
│  │          │    │ 年度总结  │    │          │    │            │  │
│  └──────────┘    └──────────┘    └──────────┘    └─────┬──────┘  │
│                                                        │         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │         │
│  │ pnpm     │───→│ Vite     │───→│ 上传     │←─────────┘         │
│  │ install  │    │ build    │    │ Pages    │                    │
│  │          │    │          │    │ Artifact │                    │
│  └──────────┘    └──────────┘    └────┬─────┘                    │
│                                       │                          │
└───────────────────────────────────────│──────────────────────────┘
                                        │
                                        v
                               ┌────────+────────┐
                               │  GitHub Pages    │
                               │                  │
                               │  quitino.github  │
                               │  .io/running_page│
                               └─────────────────┘
```

---

## 2. 数据同步阶段

### 2.1 工作流文件

文件路径：`.github/workflows/run_data_sync.yml`

### 2.2 触发条件

```
┌─────────────────────────────────────────────────────┐
│  触发方式                                             │
│                                                      │
│  1. 定时触发: cron "0 0 * * *" (每日 UTC 0:00)       │
│     └→ 即北京时间每天早上 8:00                        │
│                                                      │
│  2. 手动触发: GitHub → Actions → Run workflow         │
│     └→ 适合调试或立即同步                             │
│                                                      │
│  3. 代码推送: push 到 master 分支                     │
│     └→ 仅限以下文件变更时:                            │
│        run_page/*.py, requirements.txt               │
└─────────────────────────────────────────────────────┘
```

### 2.3 环境变量配置

在 `run_data_sync.yml` 的 `env` 部分配置（需修改为个人值）：

| 变量 | 当前值（需修改） | 说明 |
|------|-----------------|------|
| `RUN_TYPE` | `garmin_cn` | 数据来源类型 |
| `ATHLETE` | `slow is smooth, smooth is fast` | SVG 海报副标题 |
| `TITLE` | `Quitino` | SVG 海报标题 |
| `MIN_GRID_DISTANCE` | `5` | 网格图最小距离（km） |
| `TITLE_GRID` | `Over 5km Runs` | 网格图标题 |
| `IGNORE_START_END_RANGE` | `5` | 隐藏起终点范围（米） |
| `IGNORE_POLYLINE` | `ktjrFoemeU~IorGq}DeB` | 敏感区域 polyline |
| `IGNORE_RANGE` | `5` | 敏感区域隐藏范围（米） |
| `SAVE_DATA_IN_GITHUB_CACHE` | `false` | 是否用 Actions Cache 存数据 |
| `BUILD_GH_PAGES` | `true` | 同步后是否触发 Pages 构建 |
| `GENERATE_MONTH_OF_LIFE` | `true` | 是否生成月度生活海报 |
| `BIRTHDAY_MONTH` | `1989-03` | 生日月份（YYYY-MM 格式） |

### 2.4 GitHub Secrets

当前配置 (`RUN_TYPE=garmin_cn`) 需要的 Secret：

| Secret 名称 | 说明 | 获取方式 |
|-------------|------|---------|
| `GARMIN_SECRET_STRING_CN` | Garmin 中国区 OAuth 认证字符串 | 本地运行 `python run_page/get_garmin_secret.py ${email} ${password} --is-cn` |

**所有支持的 RUN_TYPE 及对应 Secrets：**

```
RUN_TYPE               所需 Secrets
─────────────────────────────────────────────────
garmin_cn           →  GARMIN_SECRET_STRING_CN
garmin              →  GARMIN_SECRET_STRING
strava              →  STRAVA_CLIENT_ID
                       STRAVA_CLIENT_SECRET
                       STRAVA_CLIENT_REFRESH_TOKEN
nike                →  NIKE_REFRESH_TOKEN
keep                →  KEEP_MOBILE, KEEP_PASSWORD
coros               →  COROS_ACCOUNT, COROS_PASSWORD
intervals_icu       →  INTERVALS_ICU_ATHLETE_ID
                       INTERVALS_ICU_API_KEY
tulipsport          →  TULIPSPORT_TOKEN
oppo                →  OPPO_ID, OPPO_CLIENT_SECRET
                       OPPO_CLIENT_REFRESH_TOKEN
only_gpx/tcx/fit    →  (无需 Secret)
```

### 2.5 同步执行流程

```
Job: sync
│
├→ actions/checkout@v4 (fetch-depth: 0)
├→ actions/setup-python@v5 (Python 3.11, pip cache)
├→ pip install -r requirements.txt
│
├→ [可选] 从 Actions Cache 恢复数据
│   仅当 SAVE_DATA_IN_GITHUB_CACHE=true 时
│   缓存: activities/, assets/, *_OUT/, data.db, activities.json, imported.json
│
├→ [按 RUN_TYPE 执行同步脚本]
│   garmin_cn 对应命令:
│   python run_page/garmin_sync.py \
│     ${{ secrets.GARMIN_SECRET_STRING_CN }} \
│     --is-cn
│
├→ [生成 SVG 海报]
│   # 总热力图
│   python run_page/gen_svg.py --from-db --type github \
│     --title "$TITLE" --athlete "$ATHLETE" \
│     --github-style "align-firstday" \
│     --special-distance 10 --special-distance2 20 \
│     --special-color yellow --special-color2 red \
│     --output assets/github.svg --use-localtime --min-distance 0.5
│
│   # 本年度热力图
│   python run_page/gen_svg.py --from-db --year $(date +"%Y") \
│     --language zh_CN --title "$(date +"%Y") Running" \
│     --type github ... --output assets/github_$(date +"%Y").svg
│
│   # 网格海报
│   python run_page/gen_svg.py --from-db --type grid \
│     --title "$TITLE_GRID" --athlete "$ATHLETE" \
│     --min-distance "$MIN_GRID_DISTANCE" --output assets/grid.svg
│
│   # 圆环海报（按年自动生成）
│   python run_page/gen_svg.py --from-db --type circular --use-localtime
│
│   # 月度生活海报（多种运动类型）
│   python run_page/gen_svg.py --from-db --type monthoflife \
│     --birth "$BIRTHDAY_MONTH" --sport-type running \
│     --output assets/mol_running.svg
│   ... (walking, hiking, cycling, swimming, skiing, all)
│
│   # 年度总结海报
│   python run_page/gen_svg.py --from-db --type year_summary \
│     --output assets/year_summary.svg
│
├→ [Git 提交并推送] (仅当不使用 cache 时)
│   git config --local user.email 'action@github.com'
│   git config --local user.name 'GitHub Action'
│   git add .
│   git commit -m 'update new runs'
│   git push
│
└→ [设置输出变量，触发 Pages 构建]
```

---

## 3. 构建与部署阶段

### 3.1 工作流文件

文件路径：`.github/workflows/gh-pages.yml`

### 3.2 权限配置

```yaml
permissions:
  contents: read      # 读取仓库代码
  pages: write        # 写入 GitHub Pages
  id-token: write     # OIDC 令牌（Pages 部署鉴权）
```

这是使用现代 GitHub Pages 部署方式（基于 artifact）所必需的权限。

### 3.3 构建流程

```
Job: build_and_deploy
│
├→ actions/checkout@v4 (master 分支)
│
├→ 配置 Node.js 20
│   ├→ npm install -g corepack
│   └→ corepack enable pnpm
│
├→ 缓存 pnpm store
│   └→ key: 基于 pnpm-lock.yaml 的 hash
│
├→ pnpm install
│
├→ PATH_PREFIX=/$REPO_NAME pnpm build
│   │
│   │  ★ PATH_PREFIX 的作用:
│   │  vite.config.ts 中:
│   │    base: process.env.PATH_PREFIX || '/'
│   │
│   │  GitHub Pages URL 结构:
│   │  https://quitino.github.io/running_page/
│   │                           └─ 子路径 ─┘
│   │
│   │  所有资源路径前缀:
│   │  /running_page/assets/index-abc123.js
│   │  /running_page/assets/index-def456.css
│   │
│   └→ 输出目录: ./dist
│
├→ actions/upload-pages-artifact@v3
│   └→ 将 ./dist 上传为 Pages artifact
│
└→ actions/deploy-pages@v4
    └→ 部署 artifact 到 GitHub Pages
```

### 3.4 并发控制

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: true
```

同一时间只允许一个 Pages 部署任务运行。新任务会取消正在进行的旧任务。

---

## 4. GitHub 仓库配置

### 4.1 Pages 设置

```
设置路径:
Settings → Pages → Build and deployment
  Source: GitHub Actions (不是 "Deploy from a branch")

┌─────────────────────────────────────────────────┐
│  GitHub Pages                                    │
│                                                  │
│  Build and deployment                            │
│  Source: ⦿ GitHub Actions                        │
│          ○ Deploy from a branch                  │
│                                                  │
│  ⚠ 必须选择 "GitHub Actions"                     │
│    否则 gh-pages.yml 的部署步骤会失败             │
└─────────────────────────────────────────────────┘
```

### 4.2 Secrets 配置

```
设置路径:
Settings → Secrets and variables → Actions → New repository secret

┌─────────────────────────────────────────────────┐
│  Repository secrets                              │
│                                                  │
│  Name: GARMIN_SECRET_STRING_CN                   │
│  Value: (Garmin 认证字符串)                       │
│                                                  │
│  获取方式:                                       │
│  在本地执行:                                     │
│  python run_page/get_garmin_secret.py \          │
│    ${你的Garmin邮箱} ${你的Garmin密码} --is-cn   │
│                                                  │
│  将输出的字符串复制到 Secret Value 中             │
└─────────────────────────────────────────────────┘
```

### 4.3 Actions 权限

```
设置路径:
Settings → Actions → General → Workflow permissions

  ⦿ Read and write permissions
    (允许 Actions 推送 commit)

  ☑ Allow GitHub Actions to create and approve pull requests
```

---

## 5. 完整部署时序

```
时间线 (以每日定时任务为例)
────────────────────────────────────────────────────────

UTC 00:00     ┌─ 定时触发 run_data_sync.yml
(北京 08:00)  │
              ├─ [sync job] (~2-5 min)
              │  ├─ 安装环境 (Python 3.11)
              │  ├─ 从 Garmin CN 下载新活动数据
              │  │   ├→ GPX/TCX/FIT 文件 → *_OUT/
              │  │   ├→ 解析 → data.db
              │  │   └→ 导出 → activities.json
              │  ├─ 生成 SVG 海报 (7+ 个文件)
              │  │   ├→ github.svg, github_YYYY.svg
              │  │   ├→ grid.svg
              │  │   ├→ year_*.svg (各年圆环)
              │  │   ├→ mol_*.svg (月度生活)
              │  │   └→ year_summary.svg
              │  └─ git commit + push
              │
              ├─ [publish_github_pages job]
              │  └─ 调用 gh-pages.yml
              │
              ├─ [build_and_deploy job] (~2-3 min)
              │  ├─ 安装 Node.js 20 + pnpm
              │  ├─ pnpm build (Vite)
              │  │   └→ PATH_PREFIX=/running_page
              │  ├─ 上传 dist/ artifact
              │  └─ 部署到 GitHub Pages
              │
~5-8 min      └─ 网站更新完成
                 https://quitino.github.io/running_page/
```

---

## 6. 本地开发调试

### 6.1 前端开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:5173)
pnpm dev

# 构建生产版本
pnpm build

# 构建时指定 base 路径（模拟 GitHub Pages）
PATH_PREFIX=/running_page pnpm build
```

### 6.2 数据同步（本地）

```bash
# 安装 Python 依赖
pip install -r requirements.txt

# Garmin CN 同步
python run_page/garmin_sync.py "你的secret_string" --is-cn

# 从本地 GPX 文件导入
python run_page/gpx_sync.py

# 从本地 TCX 文件导入
python run_page/tcx_sync.py

# 生成 SVG
python run_page/gen_svg.py --from-db --type github --title "Quitino" \
  --athlete "slow is smooth, smooth is fast" --output assets/github.svg
```

### 6.3 获取 Garmin Secret String

```bash
# 全球版
python run_page/get_garmin_secret.py your_email your_password

# 中国版
python run_page/get_garmin_secret.py your_email your_password --is-cn

# 输出的字符串即为 GARMIN_SECRET_STRING 或 GARMIN_SECRET_STRING_CN
```

---

## 7. 备选部署方案

### 7.1 Vercel 部署

```
┌─────────────────────────────────────────────────┐
│  Vercel 部署流程                                  │
│                                                  │
│  1. 在 Vercel 连接 GitHub 仓库                    │
│  2. Vercel 自动检测 Vite 项目                     │
│  3. 每次 push 到 master 自动构建部署              │
│                                                  │
│  区别:                                           │
│  ● PATH_PREFIX 不需要设置 (root 部署)             │
│  ● 自动 HTTPS + CDN + Preview Deployment         │
│  ● SAVE_DATA_IN_GITHUB_CACHE 需设为 true          │
│    (Vercel 构建时从 cache 获取数据)               │
│                                                  │
│  vercel.json 配置:                               │
│  └→ SPA rewrite: /* → /index.html                │
│  └→ 禁止从 gh-pages 分支部署 (防止重复)           │
└─────────────────────────────────────────────────┘
```

### 7.2 Docker 自托管

```
Docker 多阶段构建
┌──────────────────────────────────────────────────┐
│                                                   │
│  Stage 1: develop-py (python:slim)                │
│  └→ 安装 Python 依赖                              │
│                                                   │
│  Stage 2: develop-node (node:18)                  │
│  └→ 安装 pnpm + Node 依赖                         │
│                                                   │
│  Stage 3: data (基于 Stage 1)                     │
│  └→ 运行同步脚本 + 生成 SVG + activities.json      │
│     (通过 --build-arg app=Garmin-CN 指定)         │
│                                                   │
│  Stage 4: frontend-build (基于 Stage 2)           │
│  └→ 复制数据 → pnpm build                        │
│                                                   │
│  Stage 5: web (nginx:alpine)                      │
│  └→ 复制 dist/ → nginx 提供 HTTP 服务             │
│                                                   │
│  构建命令:                                        │
│  docker build --build-arg app=Garmin-CN \         │
│    --build-arg secret_string=xxx \                │
│    -t running_page .                              │
│                                                   │
│  运行: docker run -p 80:80 running_page           │
└──────────────────────────────────────────────────┘
```

---

## 8. 故障排查

### 8.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| Actions sync job 失败 | Secret 未配置或过期 | 重新生成 Secret String 并更新 |
| Pages 部署后 404 | Pages Source 未设为 GitHub Actions | Settings → Pages → Source: GitHub Actions |
| 页面资源加载失败 | PATH_PREFIX 未正确设置 | 检查 gh-pages.yml 中的构建命令 |
| 数据未更新 | RUN_TYPE 设为 pass | 修改为 garmin_cn 或其他 |
| Garmin Secret 过期 | garth token 有效期有限 | 重新运行 get_garmin_secret.py 获取新的 |
| SVG 海报为空 | data.db 中无数据 | 先完成数据同步再生成 SVG |
| 地图不显示 | MAPBOX_TOKEN 失效 | 使用 mapcn (CARTO) 免费方案，无需 token |

### 8.2 查看 Actions 日志

```
GitHub 仓库页面
→ Actions 标签
→ 选择工作流 "Run Data Sync"
→ 点击最近的运行
→ 展开 sync / build_and_deploy job 查看详细日志
```

---

## 9. 关键文件索引

| 文件 | 作用 |
|------|------|
| `.github/workflows/run_data_sync.yml` | 数据同步 + SVG 生成 + 触发部署 |
| `.github/workflows/gh-pages.yml` | Vite 构建 + GitHub Pages 部署 |
| `.github/workflows/ci.yml` | Python + Node CI 检查 |
| `vite.config.ts` | Vite 构建配置 (base 路径、插件、分包) |
| `package.json` | Node 依赖 + npm scripts |
| `pyproject.toml` | Python 项目配置 + 依赖声明 |
| `requirements.txt` | Python 依赖（pip install 格式） |
| `vercel.json` | Vercel 部署配置 |
| `Dockerfile` | Docker 多阶段构建 |
| `src/static/site-metadata.ts` | 站点标题/URL/导航 (需个人化) |
| `src/utils/const.ts` | 前端常量配置 (地图/颜色/文案) |
