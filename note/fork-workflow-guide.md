# Fork 仓库工作流指南

## 一、我能帮你做的 vs 你需要做的

### Claude 可以帮你做的

| 任务类型 | 具体内容 |
|---------|---------|
| 代码修改 | 编写、重构、调试代码 |
| CI 修复 | 修复 black/ruff/prettier 等格式和 lint 错误 |
| 文档编写 | 创建 proposal、design、tasks、note 等文档 |
| 代码审查 | 检查代码规范、发现潜在问题 |
| 方案设计 | 分析需求、设计实现方案 |
| 命令准备 | 整理需要执行的 git/npm 命令列表 |

### 你需要自己做的

| 任务类型 | 具体内容 |
|---------|---------|
| Git 操作 | 所有 git 命令（commit、push、cherry-pick 等） |
| GitHub 操作 | 创建 PR、关联 Issue、填写 PR 描述 |
| 代码编辑器 | 在 VSCode 中手动编辑文件（如果需要） |
| 最终确认 | 审查 Claude 的修改，决定是否采纳 |
| 敏感操作 | 强制推送、删除分支等危险操作 |

---

## 二、当前 PR 处理步骤

### 当前状态

- 代码已修改完成，CI 检查已通过
- 需要将修改分成两个 commit：**个人数据** 和 **功能代码**

### 第一步：分离 Commit

```bash
# 1. 查看当前状态
git status

# 2. 暂存个人数据文件
git add imported.json run_page/data.db src/static/activities.json assets/*.svg FIT_OUT/

# 3. 提交个人数据
git commit -m "chore: update personal running data"

# 4. 暂存功能代码文件
git add run_page/generator/__init__.py
git add run_page/gpxtrackposter/github_drawer.py
git add run_page/gpxtrackposter/grid_drawer.py
git add run_page/gpxtrackposter/track.py
git add src/utils/const.ts
git add src/utils/utils.ts
git add src/components/RunMap/index.tsx
git add src/components/RoutePreview/index.tsx

# 5. 提交功能代码
git commit -m "feat: add visual distinction for indoor running activities

- Add multi-strategy indoor detection (subtype, no GPS, tiny spread)
- Apply dashed line style for indoor tracks on map
- Add diagonal stripe pattern for indoor dates in GitHub SVG
- Apply dashed polyline for indoor tracks in Grid SVG

Closes #xxx"
```

### 第二步：创建 PR 分支

```bash
# 1. 创建并切换到 PR 分支（从当前功能 commit）
git checkout -b feat/indoor-track-visual-style

# 2. 推送到你的 fork
git push origin feat/indoor-track-visual-style
```

### 第三步：在 GitHub 创建 PR

1. 访问你的 fork: `https://github.com/Quitino/running_page`
2. 点击 "Compare & pull request" 或手动创建 PR
3. 确保：
   - **Base repository**: `yihong0618/running_page`
   - **Base**: `master`
   - **Head repository**: `Quitino/running_page`
   - **Compare**: `feat/indoor-track-visual-style`
4. 填写 PR 标题和描述
5. **关联 Issue**: 在描述中添加 `Closes #xxx` 或 `Fixes #xxx`

---

## 三、同步上游更新流程

### 初次设置（一次性）

```bash
# 添加上游仓库
git remote add upstream https://github.com/yihong0618/running_page.git

# 验证
git remote -v
# 应该看到:
# origin    https://github.com/Quitino/running_page.git (fetch)
# origin    https://github.com/Quitino/running_page.git (push)
# upstream  https://github.com/yihong0618/running_page.git (fetch)
# upstream  https://github.com/yihong0618/running_page.git (push)
```

### 定期同步

```bash
# 1. 获取上游更新
git fetch upstream

# 2. 切换到 master
git checkout master

# 3. 合并上游更新
git merge upstream/master

# 4. 推送到你的 fork
git push origin master
```

### 同步时冲突处理

如果有冲突：
```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add <resolved-files>
git commit -m "merge: resolve conflicts with upstream"
git push origin master
```

---

## 四、PR 工作流总结

```
┌─────────────────────────────────────────────────────────────┐
│                    Fork 工作流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Fork 原仓库（一次性）                                    │
│     yihong0618/running_page → Quitino/running_page          │
│                                                             │
│  2. Clone 你的 fork                                          │
│     git clone https://github.com/Quitino/running_page       │
│                                                             │
│  3. 添加上游远程                                             │
│     git remote add upstream yihong0618/running_page         │
│                                                             │
│  4. 开发功能                                                 │
│     在 master 或 feature 分支开发                            │
│                                                             │
│  5. 分离 commit                                              │
│     ├─ commit A: 个人数据 (留在 master，不 PR)              │
│     └─ commit B: 功能代码 (cherry-pick 到 PR 分支)          │
│                                                             │
│  6. 创建 PR 分支并推送                                       │
│     git checkout -b feat/xxx                                 │
│     git push origin feat/xxx                                 │
│                                                             │
│  7. 在 GitHub 创建 PR                                        │
│     Quitino/running_page:feat/xxx → yihong0618:master       │
│     描述中添加 "Closes #issue号"                             │
│                                                             │
│  8. 等待审核，响应反馈                                       │
│                                                             │
│  9. 合并后同步上游                                           │
│     git fetch upstream                                       │
│     git merge upstream/master                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、常见问题

### Q: 如何只 PR 特定的 commit？

使用 cherry-pick：
```bash
# 从 master 创建干净的 PR 分支
git checkout -b feat/xxx upstream/master  # 基于上游 master

# 或者基于本地 master 但只取特定 commit
git checkout -b feat/xxx
git reset --hard upstream/master  # 重置到上游
git cherry-pick <commit-hash>      # 只取功能 commit
git push origin feat/xxx
```

### Q: PR CI 检查失败怎么办？

1. 查看 CI 日志，找到具体错误
2. 本地修复：
   - Python: `black .` 和 `ruff check . --fix`
   - TypeScript: `pnpm check` 和 `pnpm lint`
3. 提交修复并推送

### Q: Issue 和 PR 如何关联？

在 PR 描述中使用关键词：
- `Closes #123` - 合并后自动关闭 Issue
- `Fixes #123` - 同上
- `Resolves #123` - 同上
- `Related to #123` - 只关联，不自动关闭

---

## 六、本次修改的 Commit 分离清单

### Commit 1: 个人数据 (不 PR)

```
chore: update personal running data

Files:
- imported.json
- run_page/data.db
- src/static/activities.json
- assets/github*.svg
- assets/grid.svg
- assets/year*.svg
- assets/year_summary*.svg
- FIT_OUT/*.fit
```

### Commit 2: 功能代码 (PR 到上游)

```
feat: add visual distinction for indoor running activities

- Add multi-strategy indoor detection (subtype, no GPS, tiny spread)
- Apply dashed line style for indoor tracks on map
- Add diagonal stripe pattern for indoor dates in GitHub SVG
- Apply dashed polyline for indoor tracks in Grid SVG

Files:
- run_page/generator/__init__.py
- run_page/gpxtrackposter/github_drawer.py
- run_page/gpxtrackposter/grid_drawer.py
- run_page/gpxtrackposter/track.py
- src/utils/const.ts
- src/utils/utils.ts
- src/components/RunMap/index.tsx
- src/components/RoutePreview/index.tsx

Closes #xxx  # 替换为实际 Issue 编号
```

---

*Last updated: 2026-04-07*
