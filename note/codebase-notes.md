# Running Page 代码阅读笔记

> 基于 [yihong0618/running_page](https://github.com/yihong0618/running_page) 最新 master 分支
> 笔记日期：2026-04-02
> 代码版本：v2.5.1+ (Vite 7 + React 18 + Tailwind CSS v4 + Python 3.12+)

---

## 1. 项目架构总览

### 1.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | React + TypeScript | 18.x + 5.x | 单页应用，展示跑步数据和地图 |
| **构建工具** | Vite | 7.x | 极速开发服务器 + 生产构建 |
| **地图渲染** | react-map-gl + Mapbox GL JS | 7.x + 2.x | 交互式地图渲染跑步轨迹 |
| **样式方案** | Tailwind CSS | 4.x | 实用优先的 CSS 框架 |
| **数据后端** | Python | 3.12+ | 从健身平台同步数据 |
| **数据库** | SQLite (SQLAlchemy ORM) | — | 存储活动记录 |
| **SVG 生成** | svgwrite (gpxtrackposter) | — | 生成 GitHub 热力图/网格/圆环海报 |
| **CI/CD** | GitHub Actions | — | 自动同步数据 + 构建部署 |
| **部署** | GitHub Pages / Vercel | — | 静态站点托管 |
| **包管理** | pnpm (Node) / uv (Python) | — | 前后端依赖管理 |

### 1.2 架构图

```
+-------------------------------------------------------------------+
|                        GitHub Actions (CI/CD)                      |
|                                                                    |
|  +-----------------+    +------------------+    +---------------+  |
|  | run_data_sync   |--->| gh-pages.yml     |--->| GitHub Pages  |  |
|  | .yml            |    | (构建 + 部署)     |    | (静态托管)     |  |
|  +-----------------+    +------------------+    +---------------+  |
|         |                       |                                  |
+---------|-----------------------|----------------------------------+
          |                       |
          v                       v
+---------+----------+   +-------+--------+
| Python 数据管线     |   | Vite 前端构建    |
|                    |   |                 |
| +----------------+ |   | +-------------+ |
| | garmin_sync.py | |   | | React 18    | |
| | strava_sync.py | |   | | + Mapbox GL | |
| | nike_sync.py   | |   | | + Tailwind  | |
| | keep_sync.py   | |   | | + SVG海报    | |
| | ...            | |   | +-------------+ |
| +-------+--------+ |   |       ^         |
|         |          |   +-------|--------+
|         v          |           |
| +------+--------+  |   +------+--------+
| | SQLite (ORM)  |  |   | activities    |
| | data.db       +--+-->| .json         |
| +---------------+  |   +---------------+
|         |          |
|         v          |
| +---------------+  |
| | gen_svg.py    |  |
| | → github.svg  |  |
| | → grid.svg    |  |
| | → year_*.svg  |  |
| | → mol_*.svg   |  |
| +---------------+  |
+--------------------+
```

**核心设计理念：** 这是一个 **纯静态网站**。Python 负责在构建阶段获取数据并生成
`activities.json` 和 SVG 文件，Vite 将它们打包成静态 HTML/JS/CSS，部署后无需后端服务。

---

## 2. 目录结构说明

```
running_page/
├── .github/workflows/          # GitHub Actions 工作流
│   ├── run_data_sync.yml       #   主流程：数据同步 + SVG生成 + 触发部署
│   ├── gh-pages.yml            #   前端构建 + GitHub Pages 部署
│   └── ci.yml                  #   CI：Python lint + Node lint/build
│
├── run_page/                   # ★ Python 数据后端
│   ├── generator/              #   核心数据管线
│   │   ├── __init__.py         #     Generator 类（同步/加载活动）
│   │   └── db.py               #     SQLAlchemy Activity 模型 + 数据库操作
│   ├── gpxtrackposter/         #   SVG 海报生成库（fork 自 flopp）
│   │   ├── poster.py           #     Poster 主类
│   │   ├── track.py            #     Track 数据结构
│   │   ├── track_loader.py     #     GPX/TCX/FIT 文件解析器
│   │   ├── github_drawer.py    #     GitHub 热力图绘制
│   │   ├── grid_drawer.py      #     网格海报绘制
│   │   ├── circular_drawer.py  #     圆环海报绘制
│   │   ├── month_of_life_drawer.py  # 月度生活海报绘制
│   │   └── year_summary_drawer.py   # 年度总结海报绘制
│   ├── garmin_sync.py          #   Garmin Connect 数据同步（异步下载）
│   ├── strava_sync.py          #   Strava API 数据同步
│   ├── nike_sync.py            #   Nike Run Club 数据同步
│   ├── keep_sync.py            #   Keep 数据同步
│   ├── coros_sync.py           #   COROS 数据同步
│   ├── intervals_icu_sync.py   #   Intervals.icu 数据同步
│   ├── gpx_sync.py             #   本地 GPX 文件导入
│   ├── tcx_sync.py             #   本地 TCX 文件导入
│   ├── fit_sync.py             #   本地 FIT 文件导入
│   ├── gen_svg.py              #   SVG 海报生成入口
│   ├── config.py               #   路径常量 + YAML 配置加载
│   ├── utils.py                #   工具函数（make_activities_file 等）
│   ├── polyline_processor.py   #   隐私过滤（隐藏起终点/敏感区域）
│   ├── fix_location.py         #   位置/坐标修复
│   ├── db_updater.py           #   数据库字段升级（添加 elevation_gain）
│   ├── synced_data_file_logger.py  # 已同步文件追踪（imported.json）
│   ├── garmin_device_adaptor.py    # Garmin 设备数据适配器
│   └── *_to_*_sync.py         #   跨平台同步脚本
│
├── src/                        # ★ React 前端源码
│   ├── main.tsx                #   入口：React 18 + Router
│   ├── pages/
│   │   ├── index.tsx           #   主页面（地图 + 统计 + 表格）
│   │   ├── total.tsx           #   Summary 页面（活动列表）
│   │   └── 404.tsx             #   404 页面
│   ├── components/
│   │   ├── Layout/             #   页面布局 + Helmet
│   │   ├── Header/             #   导航栏
│   │   ├── RunMap/             #   Mapbox 交互地图
│   │   │   ├── index.tsx       #     地图主组件
│   │   │   ├── RunMarker.tsx   #     起终点标记
│   │   │   ├── RunMapButtons.tsx#    地图控制按钮
│   │   │   └── LightsControl.tsx#   明暗主题切换
│   │   ├── RunTable/           #   可排序的跑步表格
│   │   │   ├── index.tsx       #     表格主组件
│   │   │   └── RunRow.tsx      #     单行活动记录
│   │   ├── SVGStat/            #   渲染 github.svg + grid.svg
│   │   ├── YearsStat/          #   年份选择器 + 统计列表
│   │   ├── YearStat/           #   单年统计（距离/配速/心率）
│   │   ├── LocationStat/       #   地区统计（省份/城市/时段）
│   │   │   ├── CitiesStat.tsx  #     城市排行
│   │   │   ├── LocationSummary.tsx # 省份/国家汇总
│   │   │   └── PeriodStat.tsx  #     时段分布
│   │   ├── ActivityList/       #   Summary 页的完整活动列表
│   │   ├── RoutePreview/       #   路线预览组件
│   │   ├── YearSummaryModal/   #   年度总结弹窗
│   │   └── Stat/               #   复用的统计展示组件
│   ├── hooks/
│   │   ├── useActivities.ts    #   加载 activities.json，计算城市/年份/时段
│   │   ├── useSiteMetadata.ts  #   返回站点配置
│   │   ├── useHover.ts         #   悬停状态 Hook
│   │   ├── useInterval.ts      #   定时器 Hook（动画用）
│   │   ├── usePageTracking.ts  #   Google Analytics 页面跟踪
│   │   └── useTheme.ts         #   明暗主题管理
│   ├── static/
│   │   ├── activities.json     #   ★ 核心数据文件（Python 生成，前端消费）
│   │   ├── site-metadata.ts    #   站点标题/URL/Logo/导航
│   │   ├── run_countries.ts    #   中国省份/国家 GeoJSON
│   │   └── city.ts             #   中国城市列表
│   ├── utils/
│   │   ├── const.ts            #   ★ 所有可配置常量（地图、颜色、文案）
│   │   ├── utils.ts            #   polyline 解码、坐标转换、过滤
│   │   ├── colorUtils.ts       #   SVG 颜色主题调整
│   │   ├── routeAnimation.ts   #   路线动画逻辑
│   │   ├── svgUtils.tsx        #   SVG 懒加载工具
│   │   └── trackRoute.tsx      #   GA 路由跟踪包装器
│   └── styles/
│       ├── index.css           #   全局样式（Tailwind CSS v4）
│       └── mobile.css          #   移动端响应式样式
│
├── assets/                     #   生成的 SVG 海报 + 静态图标
│   ├── github.svg              #     GitHub 风格热力图
│   ├── grid.svg                #     网格海报
│   ├── year_YYYY.svg           #     各年份圆环海报
│   ├── github_YYYY.svg         #     各年份 GitHub 热力图
│   ├── mol.svg                 #     Month of Life 总海报
│   ├── mol_running.svg         #     跑步 Month of Life
│   ├── mol_*.svg               #     其他运动类型 Month of Life
│   ├── year_summary.svg        #     年度总结海报
│   ├── start.svg, end.svg      #     地图标记图标
│   └── index.tsx               #     SVG 资源导出模块
│
├── GPX_OUT/                    #   下载的 GPX 轨迹文件
├── TCX_OUT/                    #   下载的 TCX 轨迹文件
├── FIT_OUT/                    #   下载的 FIT 轨迹文件
├── PNG_OUT/                    #   路线截图
├── Workouts/                   #   Endomondo 数据
├── activities/                 #   单条活动 JSON（可选输出）
│
├── index.html                  #   Vite 入口 HTML
├── package.json                #   Node 依赖 + npm scripts
├── pnpm-lock.yaml              #   pnpm 锁文件
├── pyproject.toml              #   Python 项目配置 + 依赖
├── uv.lock                     #   uv 锁文件
├── vite.config.ts              #   Vite 构建配置
├── tsconfig.json               #   TypeScript 配置
├── eslint.config.cjs           #   ESLint 9 flat config
├── vercel.json                 #   Vercel 部署配置
├── Dockerfile                  #   多阶段 Docker 构建
├── requirements.txt            #   Python 依赖（pip 格式）
├── config-example.yaml         #   Garmin 凭证模板
└── imported.json               #   已同步文件列表（防重复导入）
```

---

## 3. 数据流管线

### 3.1 端到端数据流

```
 ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
 │  数据源      │     │  数据源      │     │  数据源      │     │  数据源       │
 │  Garmin CN   │     │  Strava     │     │  本地文件    │     │ Intervals.icu│
 │  (API)       │     │  (API)      │     │  GPX/TCX/FIT│     │  (API)       │
 └──────┬───────┘     └──────┬──────┘     └──────┬──────┘     └──────┬───────┘
        │                    │                    │                    │
        v                    v                    v                    v
 ┌──────+────────────────────+────────────────────+────────────────────+──────┐
 │                    Python 同步脚本 (run_page/)                             │
 │  garmin_sync.py  strava_sync.py  gpx_sync.py  intervals_icu_sync.py ...  │
 │                                                                           │
 │  1. 通过 API 获取活动列表                                                  │
 │  2. 下载 GPX/TCX/FIT 文件到 *_OUT/ 目录                                    │
 │  3. 解析文件提取：距离/时间/配速/心率/GPS轨迹/海拔                          │
 │  4. synced_data_file_logger 记录已导入文件到 imported.json                  │
 └────────────────────────┬──────────────────────────────────────────────────┘
                          │
                          v
 ┌────────────────────────+───────────────────────────────┐
 │              SQLite 数据库 (run_page/data.db)            │
 │                                                         │
 │  Activity 表:                                           │
 │  run_id | name | distance | moving_time | type |        │
 │  subtype | start_date | start_date_local |              │
 │  location_country | summary_polyline |                  │
 │  average_heartrate | average_speed | elevation_gain     │
 │                                                         │
 │  ● update_or_create_activity() 执行 upsert              │
 │  ● 首次插入时通过 Nominatim 反向地理编码填充 location      │
 └──────────┬──────────────────────────┬──────────────────┘
            │                          │
            v                          v
 ┌──────────+──────────┐   ┌──────────+──────────────────┐
 │  gen_svg.py          │   │  Generator.load()            │
 │                      │   │                              │
 │  从 DB 读取轨迹      │   │  1. 查询 distance > 0.1      │
 │  生成 SVG 海报:      │   │  2. 计算连续跑步天数 (streak) │
 │  ● github.svg        │   │  3. 隐私过滤 (polyline)      │
 │  ● grid.svg          │   │  4. 序列化为 JSON            │
 │  ● year_YYYY.svg     │   │                              │
 │  ● mol_*.svg         │   │                              │
 │  ● year_summary.svg  │   │                              │
 └──────────┬──────────┘   └──────────┬──────────────────┘
            │                          │
            v                          v
 ┌──────────+──────────┐   ┌──────────+──────────────────┐
 │  assets/*.svg        │   │  src/static/activities.json   │
 │  (静态 SVG 文件)     │   │  (所有活动的 JSON 数组)       │
 └──────────┬──────────┘   └──────────┬──────────────────┘
            │                          │
            +──────────┬───────────────+
                       │
                       v
 ┌─────────────────────+─────────────────────────────────┐
 │              Vite 构建 (pnpm build)                     │
 │                                                         │
 │  ● 打包 React 组件 + activities.json + SVG 海报          │
 │  ● PATH_PREFIX 设置 base 路径（GitHub Pages 子目录）      │
 │  ● 输出到 ./dist 目录                                    │
 └─────────────────────┬─────────────────────────────────┘
                       │
                       v
 ┌─────────────────────+─────────────────────────────────┐
 │              GitHub Pages 部署                           │
 │                                                         │
 │  ● actions/upload-pages-artifact 上传 dist/              │
 │  ● actions/deploy-pages 发布到 GitHub Pages              │
 │  ● 访问地址: https://quitino.github.io/running_page     │
 └───────────────────────────────────────────────────────┘
```

### 3.2 单条活动的数据结构

Python 端写入 `activities.json` 的每条活动：

```json
{
  "run_id": 199190291,
  "name": "午间跑步",
  "distance": 5432.1,
  "moving_time": "0:32:15",
  "type": "Run",
  "subtype": "",
  "start_date": "2024-07-15 02:30:00",
  "start_date_local": "2024-07-15 10:30:00",
  "location_country": "中国北京市朝阳区",
  "summary_polyline": "encoded_polyline_string...",
  "average_heartrate": 155.0,
  "average_speed": 2.81,
  "elevation_gain": 42.5,
  "streak": 3
}
```

**关键字段说明：**

| 字段 | 类型 | 单位 | 说明 |
|------|------|------|------|
| `run_id` | Integer | — | 活动唯一标识（来源平台的 ID） |
| `name` | String | — | 活动名称（如"午间跑步"） |
| `distance` | Float | 米 | 总距离 |
| `moving_time` | String | H:M:S | 运动时间 |
| `type` | String | — | 活动类型：Run/Walk/Hike/Ride/Swim/Ski |
| `subtype` | String | — | 子类型：Trail/Treadmill 等（新版新增） |
| `start_date` | String | UTC | 开始时间 |
| `start_date_local` | String | 本地时区 | 本地开始时间 |
| `location_country` | String | — | 地理位置（反向地理编码结果） |
| `summary_polyline` | String | — | Google Encoded Polyline 格式的 GPS 轨迹 |
| `average_heartrate` | Float | bpm | 平均心率 |
| `average_speed` | Float | m/s | 平均速度 |
| `elevation_gain` | Float | 米 | 海拔爬升（新版新增） |
| `streak` | Integer | 天 | 连续运动天数（动态计算） |

### 3.3 隐私过滤机制

```
原始 Polyline (GPS 轨迹)
        │
        v
┌───────+───────────────────────────────────┐
│  polyline_processor.filter_out()           │
│                                            │
│  Step 1: start_end_hiding()                │
│  ● 从轨迹首尾移除 IGNORE_START_END_RANGE  │
│    (默认 10m) 范围内的点                    │
│                                            │
│  Step 2: range_hiding()                    │
│  ● 移除 IGNORE_POLYLINE 定义的敏感区域      │
│    附近 IGNORE_RANGE (默认 10m) 内的点      │
│                                            │
│  使用 eviltransform 进行 GCJ-02→WGS-84     │
│  坐标转换（中国区数据需要）                  │
└───────┬───────────────────────────────────┘
        │
        v
过滤后的 Polyline (对外展示)
```

**过滤时机：**
- `IGNORE_BEFORE_SAVING=True`: 写入数据库前过滤（永久丢弃原始点）
- 默认：在 `Generator.load()` 导出 JSON 时过滤（数据库保留原始数据）

---

## 4. Python 后端模块详解

### 4.1 config.py — 配置中心

定义所有路径常量和 API 配置：

```python
SQL_FILE     = "run_page/data.db"           # SQLite 数据库
JSON_FILE    = "src/static/activities.json"  # 前端数据文件
GPX_FOLDER   = "GPX_OUT"                    # GPX 下载目录
TCX_FOLDER   = "TCX_OUT"                    # TCX 下载目录
FIT_FOLDER   = "FIT_OUT"                    # FIT 下载目录
OUTPUT_DIR   = "activities"                 # 单条活动 JSON 输出
SYNCED_FILE  = "imported.json"              # 已同步文件列表
TIMEZONE     = "Asia/Shanghai"              # 默认时区
```

`config(*keys)` 函数从可选的 `config.yaml` 读取 Garmin 凭证等配置。

### 4.2 generator/db.py — 数据库层

**Activity 模型** (SQLAlchemy ORM):

```
activities 表
┌──────────────────┬───────────┬─────────────────────────┐
│ 字段              │ 类型      │ 说明                     │
├──────────────────┼───────────┼─────────────────────────┤
│ run_id (PK)      │ Integer   │ 活动唯一 ID              │
│ name             │ String    │ 活动名称                 │
│ distance         │ Float     │ 距离（米）               │
│ moving_time      │ Interval  │ 运动时间                 │
│ elapsed_time     │ Interval  │ 总用时                   │
│ type             │ String    │ 活动类型 (Run/Walk/...)  │
│ subtype          │ String    │ 子类型 (Trail/Treadmill) │
│ start_date       │ String    │ UTC 开始时间             │
│ start_date_local │ String    │ 本地开始时间             │
│ location_country │ String    │ 地理位置（反向地理编码）  │
│ summary_polyline │ String    │ GPS 轨迹 (Encoded)       │
│ average_heartrate│ Float     │ 平均心率                 │
│ average_speed    │ Float     │ 平均速度 (m/s)           │
│ elevation_gain   │ Float     │ 海拔爬升（米）           │
└──────────────────┴───────────┴─────────────────────────┘
```

**核心函数 `update_or_create_activity()`:**
1. 按 `run_id` 查找是否已存在
2. 不存在 → 反向地理编码获取地名 → INSERT
3. 已存在 → UPDATE 可变字段（name、distance、speed、heartrate、polyline、elevation_gain 等）

### 4.3 generator/__init__.py — Generator 类

这是数据管线的核心编排器：

```
Generator 类方法调用关系
┌─────────────────────────────────────────────────┐
│                                                  │
│  sync()                 ← Strava API 同步         │
│    └→ update_or_create_activity()                │
│                                                  │
│  sync_from_data_dir()   ← 本地文件导入            │
│    ├→ track_loader.load_tracks()                 │
│    └→ update_or_create_activity()                │
│                                                  │
│  sync_from_app()        ← App 数据同步            │
│    └→ update_or_create_activity()                │
│       (Garmin/Nike/Keep/COROS 等脚本调用)         │
│                                                  │
│  load()                 ← 导出数据                │
│    ├→ 查询所有 distance > 0.1 的活动              │
│    ├→ 计算 streak（连续跑步天数）                  │
│    ├→ polyline_processor.filter_out()            │
│    └→ 返回 JSON 可序列化的 dict 列表              │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 4.4 同步脚本一览

#### 主要平台同步脚本

| 脚本 | 数据源 | 认证方式 | 特殊功能 |
|------|--------|---------|---------|
| `garmin_sync.py` | Garmin Connect (Global/CN) | garth Secret String | `--is-cn` 中国区, `--tcx`/`--fit` 格式选择 |
| `strava_sync.py` | Strava API | OAuth2 (stravalib) | 增量同步 |
| `nike_sync.py` | Nike Run Club | Refresh Token | — |
| `keep_sync.py` | Keep | 手机号+密码 | `--with-gpx`, GCJ-02→WGS-84 |
| `coros_sync.py` | COROS | 账号+密码 | `--only-run` |
| `intervals_icu_sync.py` | Intervals.icu | Athlete ID + API Key | `--all` 全类型 |
| `gpx_sync.py` | 本地 GPX 文件 | 无需认证 | 从 GPX_OUT/ 导入 |
| `tcx_sync.py` | 本地 TCX 文件 | 无需认证 | 从 TCX_OUT/ 导入 |
| `fit_sync.py` | 本地 FIT 文件 | 无需认证 | 从 FIT_OUT/ 导入 |

#### 跨平台备份脚本

| 脚本 | 方向 | 用途 |
|------|------|------|
| `nike_to_strava_sync.py` | Nike → Strava | 数据备份 |
| `garmin_to_strava_sync.py` | Garmin → Strava | 数据备份 |
| `strava_to_garmin_sync.py` | Strava → Garmin | 数据备份 |
| `keep_to_strava_sync.py` | Keep → Strava | 数据备份 |
| `tcx_to_garmin_sync.py` | TCX → Garmin | 文件上传 |

### 4.5 garmin_sync.py — Garmin 数据同步详解

**工作流程：**

```
garmin_sync.py 执行流程
│
├→ 1. garth 库认证
│     ├→ 使用 Secret String（base64 编码的 OAuth tokens）
│     └→ --is-cn 参数决定使用中国区/全球服务器
│
├→ 2. 获取活动列表
│     └→ Garmin API: /activitylist-service/activities/search
│
├→ 3. 增量下载
│     ├→ 检查 *_OUT/ 目录中已有文件
│     ├→ 只下载新活动的文件
│     └→ asyncio + gather_with_concurrency(10) 并发下载
│
├→ 4. 文件格式选择
│     ├→ 默认: GPX
│     ├→ --tcx: TCX 格式
│     └→ --fit: FIT 格式
│
├→ 5. 数据入库
│     └→ make_activities_file() → 解析文件 → 入库 → 生成 JSON
│
└→ 6. 输出
      ├→ GPX_OUT/ 或 TCX_OUT/ 或 FIT_OUT/ (轨迹文件)
      ├→ run_page/data.db (数据库更新)
      └→ src/static/activities.json (前端数据)
```

### 4.6 gen_svg.py — SVG 海报生成

基于 `gpxtrackposter` 库生成多种可视化海报：

```
gen_svg.py 支持的海报类型
┌─────────────────────────────────────────────────────┐
│                                                      │
│  --type github  ──→  GitHub 风格热力图               │
│     │                 ┌──────────────────────────┐   │
│     │                 │ ■■■ ■■ ■■■■■ ■■■        │   │
│     │                 │ ■ ■■■■ ■ ■■■■■■■        │   │
│     │                 │ ■■■■ ■■■ ■■■ ■■■■       │   │
│     │                 └──────────────────────────┘   │
│     │                 → assets/github.svg             │
│     │                 → assets/github_YYYY.svg (年度) │
│     │                                                │
│  --type grid    ──→  网格海报（轨迹缩略图）          │
│     │                 ┌──────────────────────────┐   │
│     │                 │ ╱╲ ╱╲  ╱╲╱╲  ╱╲╱╲╱╲    │   │
│     │                 │ ╱╲╱╲╱╲  ╱╲   ╱╲╱╲╱╲    │   │
│     │                 └──────────────────────────┘   │
│     │                 → assets/grid.svg               │
│     │                                                │
│  --type circular ──→ 圆环海报（按年生成）             │
│     │                 → assets/year_YYYY.svg          │
│     │                                                │
│  --type monthoflife → 月度生活海报                    │
│     │                 → assets/mol.svg (总)           │
│     │                 → assets/mol_running.svg (跑步) │
│     │                 → assets/mol_*.svg (各类型)     │
│     │                                                │
│  --type year_summary → 年度总结海报                   │
│                       → assets/year_summary.svg       │
└─────────────────────────────────────────────────────┘
```

### 4.7 utils.py — 核心工具函数

`make_activities_file(sql_file, data_dir, json_file, file_suffix)` 是每个同步脚本的"终点函数"：

```
make_activities_file()
│
├→ Generator(sql_file)           # 初始化数据库连接
├→ sync_from_data_dir(data_dir)  # 解析文件 → 入库
├→ load()                        # 从库中读取 → 过滤 → 序列化
└→ json.dump(json_file)          # 写入 activities.json
```

---

## 5. React 前端组件详解

### 5.1 路由与入口

```
src/main.tsx
│
├→ createBrowserRouter([
│    { path: "/",        element: <Index /> },
│    { path: "/summary", element: <HomePage /> },
│    { path: "*",        element: <NotFound /> }
│  ])
│
├→ basename = import.meta.env.BASE_URL
│   (由 vite.config.ts 中的 PATH_PREFIX 决定)
│
└→ <HelmetProvider>
     <RouterProvider />
   </HelmetProvider>
```

### 5.2 主页面布局 (src/pages/index.tsx)

```
Index 页面布局
┌────────────────────────────────────────────────┐
│  Header (导航栏：Logo + 链接)                    │
├──────────────┬─────────────────────────────────┤
│  左栏 (30%)   │  右栏 (70%)                      │
│              │                                  │
│  标题 + 统计  │  ┌──────────────────────────┐   │
│              │  │   RunMap (Mapbox 地图)     │   │
│  年份="Total" │  │   - 所有轨迹叠加显示       │   │
│  → LocationStat│ │   - 支持缩放/平移/点选     │   │
│    (省份/城市) │  └──────────────────────────┘   │
│              │                                  │
│  年份=具体年   │  年份="Total":                   │
│  → YearsStat │  ┌──────────────────────────┐   │
│    (各年统计)  │  │  SVGStat (热力图+网格)    │   │
│              │  └──────────────────────────┘   │
│              │                                  │
│              │  年份=具体年:                     │
│              │  ┌──────────────────────────┐   │
│              │  │  RunTable (跑步列表)       │   │
│              │  └──────────────────────────┘   │
├──────────────┴─────────────────────────────────┤
│  Footer                                         │
└────────────────────────────────────────────────┘
```

**状态管理（React useState + URL hash）：**
- `year`: 当前选中的年份（"Total" 或具体年份字符串）
- `runIndex`: 选中的跑步索引（高亮地图上的轨迹）
- `runs`: 当前过滤后的跑步列表
- `geoData`: GeoJSON 格式的轨迹数据（供 Mapbox 渲染）
- `viewState`: 地图视角（缩放/中心点）

**渐进式动画：** 切换年份时，跑步轨迹通过 `useInterval` 分批添加到地图上，产生"逐条绘制"的动画效果。

### 5.3 RunMap 组件

```
RunMap 组件架构
│
├→ react-map-gl <Map>
│   ├→ 地图底图:
│   │   MAP_TILE_VENDOR = 'mapcn' (默认使用 CARTO 免费底图)
│   │   可选: mapbox, maptiler, stadiamaps
│   │
│   ├→ 明暗主题:
│   │   亮色: osm-bright (CARTO Voyager)
│   │   暗色: dark-matter (CARTO Dark Matter)
│   │   通过 LightsControl 组件切换
│   │
│   ├→ IS_CHINESE && zoom <= 3:
│   │   └→ 渲染中国省份 GeoJSON (fill 层)
│   │       已跑过的省份着色 PROVINCE_FILL_COLOR
│   │
│   ├→ 正常视图 (多条轨迹):
│   │   └→ 渲染 GeoJSON LineString 轨迹
│   │       ├→ 虚线: USE_DASH_LINE = true
│   │       ├→ 透明度: LINE_OPACITY = 0.4
│   │       └→ 颜色: MAIN_COLOR = rgb(224,237,94) (Nike 黄绿)
│   │
│   └→ 单条轨迹视图:
│       ├→ RunMarker (起点/终点标记 SVG)
│       └→ 路线动画 (routeAnimation.ts)
│
├→ RunMapButtons
│   ├→ 全局视图按钮
│   └→ 缩放控制
│
└→ 坐标处理:
    ├→ @mapbox/polyline.decode() 解码 Encoded Polyline
    ├→ gcoord GCJ-02→WGS-84 转换 (NEED_FIX_MAP=true 时)
    └→ @math.gl/web-mercator 视口计算
```

### 5.4 数据处理 Hook — useActivities

```typescript
const {
  activities,   // Activity[] — 全部活动
  years,        // string[] — 降序排列的年份数组
  countries,    // Set<string> — 所有国家
  provinces,    // Set<string> — 所有省份
  cities,       // Map<string, number> — 城市→总距离
  runPeriod,    // Map<string, number> — 时段→次数
  thisYear,     // string — 最近有数据的年份
} = useActivities();
```

**数据加载流程：**
1. 静态 `import` 引入 `activities.json`（Vite 构建时内联）
2. `useMemo` 遍历所有活动，构建聚合数据
3. 城市提取逻辑：从 `location_country` 字段解析省份和城市
4. 时段分类：根据 `start_date_local` 的小时数分为晨/午/下午/傍晚/夜

### 5.5 关键配置文件

#### src/utils/const.ts

```
核心配置项:
┌──────────────────────────────────────────────┐
│ IS_CHINESE        = true                      │ ← 启用中文 UI + 省份地图
│ USE_DASH_LINE     = true                      │ ← 虚线轨迹
│ LINE_OPACITY      = 0.4                       │ ← 轨迹透明度
│ MAP_HEIGHT        = 600 (桌面) / 250 (移动端) │ ← 响应式高度
│ PRIVACY_MODE      = false                     │ ← 隐私模式（隐藏底图）
│ LIGHTS_ON         = false                     │ ← 默认暗色主题
│ SHOW_ELEVATION_GAIN = false                   │ ← 显示海拔爬升列
│ RICH_TITLE        = false                     │ ← Garmin 风格丰富标题
│ NEED_FIX_MAP      = false                     │ ← GCJ-02→WGS-84 修正
│                                               │
│ MAP_TILE_VENDOR   = 'mapcn'                   │ ← 地图底图供应商
│ MAP_TILE_STYLE_LIGHT = 'osm-bright'           │ ← 亮色主题样式
│ MAP_TILE_STYLE_DARK  = 'dark-matter'          │ ← 暗色主题样式
│ MAP_TILE_ACCESS_TOKEN = ''                    │ ← mapcn 无需 token
│                                               │
│ MAIN_COLOR        = rgb(224,237,94) (Nike黄绿)│ ← 主色调
│ PROVINCE_FILL_COLOR = #47b8e0                 │ ← 省份填充色
│ RUN_COLOR_LIGHT   = #47b8e0                   │ ← 亮色主题路线色
│ RUN_COLOR_DARK    = MAIN_COLOR                │ ← 暗色主题路线色
└──────────────────────────────────────────────┘
```

#### src/static/site-metadata.ts

```typescript
const data = {
  siteTitle: 'Running Page',        // 站点标题（需修改）
  siteUrl: 'https://yihong.run',    // 站点 URL（需修改）
  logo: '...',                      // Logo 图片 URL
  description: 'Personal site',
  navLinks: [                       // 导航链接（需修改）
    { name: 'Summary', url: `${getBasePath()}/summary` },
    { name: 'Blog', url: '...' },
    { name: 'About', url: '...' },
  ],
};
```

---

## 6. GitHub Actions 工作流详解

### 6.1 run_data_sync.yml — 数据同步主流程

```
触发条件:
  ● 每日 UTC 0:00 定时触发 (北京时间 8:00)
  ● 手动触发 (workflow_dispatch)
  ● Push 到 master（仅限 Python 同步脚本或 requirements.txt 变更时）

执行流程:
┌─────────────────────────────────────────────┐
│  Job: sync (ubuntu-latest, Python 3.11)      │
│                                              │
│  1. 检出代码 (fetch-depth: 0)                │
│  2. 安装 Python 依赖 (pip cache)             │
│  3. 可选：从 Actions Cache 恢复数据文件       │
│  4. 按 RUN_TYPE 执行对应同步脚本:             │
│     garmin_cn → garmin_sync.py --is-cn       │
│  5. 生成 SVG 海报:                            │
│     ● github.svg (总热力图)                   │
│     ● github_YYYY.svg (本年热力图)            │
│     ● grid.svg (网格海报)                     │
│     ● year_*.svg (圆环海报)                   │
│     ● mol_*.svg (月度生活海报)                │
│     ● year_summary.svg (年度总结)             │
│  6. 如不使用 cache: git add + commit + push   │
│                                              │
│  输出: BUILD_GH_PAGES=true                   │
└─────────────────┬───────────────────────────┘
                  │ (如果 BUILD_GH_PAGES=true)
                  v
┌─────────────────+───────────────────────────┐
│  Job: publish_github_pages                   │
│  → 调用 gh-pages.yml (可复用工作流)           │
└─────────────────────────────────────────────┘
```

### 6.2 gh-pages.yml — 构建与部署

```
执行流程:
┌────────────────────────────────────────────┐
│  Job: build_and_deploy                      │
│  权限: pages:write, id-token:write          │
│                                             │
│  1. 检出 master 分支                         │
│  2. 配置 Node.js 20 + corepack + pnpm       │
│  3. pnpm install (缓存 store)               │
│  4. PATH_PREFIX=/<repo-name> pnpm build     │
│     ↑ 关键：设置 Vite base 路径              │
│  5. 上传 ./dist 为 Pages artifact            │
│  6. actions/deploy-pages@v4 部署             │
└────────────────────────────────────────────┘
```

### 6.3 ci.yml — CI 检查

```
触发: push + PR
矩阵测试:
  ● Python 3.12/3.13/3.14 → gpx_sync.py, black, ruff
  ● Node 20/22/24 → pnpm check, lint, build
```

---

## 7. 依赖说明

### 7.1 Node.js 依赖 (package.json)

**核心运行时：**
- `react` 18, `react-dom`, `react-router-dom` 6
- `react-map-gl` 7, `mapbox-gl` 2
- `@mapbox/polyline` — Encoded Polyline 编解码
- `gcoord` — 坐标系转换 (GCJ-02 ↔ WGS-84)
- `recharts` 2 — 图表组件
- `@surbowl/world-geo-json-zh` — 中文 GeoJSON 数据
- `rc-virtual-list` — 虚拟滚动列表
- `react-ga4` — Google Analytics 4
- `react-helmet-async` — 文档头管理

**开发工具：**
- `vite` 7, `vite-plugin-svgr` — SVG React 组件
- `@tailwindcss/vite` — Tailwind CSS v4 Vite 插件
- `typescript` 5, `eslint` 9

**关键 Scripts：**
```
pnpm dev       — 启动开发服务器
pnpm build     — 构建生产版本 (→ dist/)
pnpm run ci    — format + lint + build
```

### 7.2 Python 依赖 (pyproject.toml / requirements.txt)

**核心：**
- `httpx` — 异步 HTTP 客户端
- `garth` — Garmin Connect OAuth 认证
- `stravalib` 0.10.4, `stravaweblib` — Strava API
- `gpxpy` 1.6.2 — GPX 文件解析
- `polyline` — Encoded Polyline 编解码
- `sqlalchemy` — 数据库 ORM
- `eviltransform` — GCJ-02 坐标转换
- `svgwrite`, `cairosvg` — SVG 生成和转换
- `geopy`, `haversine` — 地理计算
- `arrow` — 日期时间处理
- `rich` — 终端美化输出

---

## 8. 新版本变化（对比旧代码）

| 方面 | 旧版本 | 新版本 |
|------|--------|--------|
| CSS 框架 | SCSS Modules + Tachyons | Tailwind CSS v4 |
| 构建工具 | Vite 4 | Vite 7 |
| ESLint | .eslintrc.js (传统配置) | eslint.config.cjs (flat config) |
| 地图底图 | 默认 Mapbox | 默认 CARTO 免费底图 (mapcn) |
| 地图主题 | 固定暗色 | 支持明暗切换 (LightsControl) |
| Python 包管理 | pip | uv (pyproject.toml + uv.lock) |
| Python 版本 | 3.10+ | 3.12+ |
| 新同步源 | — | Intervals.icu, Tulipsport |
| 新海报 | — | Month of Life, Year Summary |
| 新页面 | — | /summary (活动列表页) |
| 新字段 | — | subtype, elevation_gain |
| 数据库升级 | — | db_updater.py 添加字段 |
| 坐标转换 | — | eviltransform (GCJ-02→WGS-84) |
| 路线预览 | — | RoutePreview 组件 |
| 年度总结 | — | YearSummaryModal 弹窗 |
