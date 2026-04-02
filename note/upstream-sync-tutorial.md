# 从上游仓库同步更新教程

> 如何将原作者 (yihong0618/running_page) 的更新同步到你的仓库 (Quitino/running_page)
> 笔记日期：2026-04-02

---

## 0. 你的仓库现状说明

你的仓库当前已配置好 remote：

```bash
$ git remote -v
origin    git@github-personal:Quitino/running_page.git (fetch)
origin    git@github-personal:Quitino/running_page.git (push)
upstream  https://github.com/yihong0618/running_page.git (fetch)
upstream  https://github.com/yihong0618/running_page.git (push)
```

```
┌──────────────────────────────────────────────────────┐
│                     GitHub 服务器                      │
│                                                       │
│  ┌───────────────────┐     ┌───────────────────────┐ │
│  │ yihong0618/        │     │ Quitino/              │ │
│  │ running_page       │     │ running_page          │ │
│  │                    │     │                       │ │
│  │ (上游仓库)         │     │ (你的仓库)             │ │
│  │ 原作者维护          │     │ 你的修改 + 数据        │ │
│  └────────┬───────────┘     └───────────┬───────────┘ │
│           │                             │             │
└───────────│─────────────────────────────│─────────────┘
            │                             │
            │  upstream                   │  origin
            │  (上游远程)                  │  (默认远程)
            │  已配置 ✓                    │  已配置 ✓
            │                             │
            └──────────┐    ┌─────────────┘
                       │    │
                       v    v
              ┌────────────────────┐
              │  你的本地仓库       │
              │  (电脑上的代码)     │
              │                    │
              │  master 分支       │
              └────────────────────┘
```

---

## 1. 同步操作流程

### 1.1 完整流程图

```
┌─────────────────────────────────────────────────────┐
│                  同步更新流程                         │
│                                                      │
│  Step 1: 获取上游最新代码                             │
│  ┌─────────────────────────────────┐                │
│  │ git fetch upstream              │                │
│  │                                 │                │
│  │ 从 yihong0618/running_page      │                │
│  │ 下载最新提交到本地               │                │
│  │ (不会修改你的文件)               │                │
│  └──────────────┬──────────────────┘                │
│                 │                                    │
│                 v                                    │
│  Step 2: 确保在 master 分支                          │
│  ┌─────────────────────────────────┐                │
│  │ git checkout master             │                │
│  └──────────────┬──────────────────┘                │
│                 │                                    │
│                 v                                    │
│  Step 3: 合并上游代码                                │
│  ┌─────────────────────────────────┐                │
│  │ git merge upstream/master       │                │
│  │                                 │                │
│  │ 将上游更新合并到你的 master      │                │
│  └──────────────┬──────────────────┘                │
│                 │                                    │
│          ┌──────+──────┐                            │
│          │  有冲突？    │                            │
│          └──────┬──────┘                            │
│         ┌───NO──┴──YES───┐                          │
│         │                │                          │
│         v                v                          │
│  ┌──────+──────┐  ┌─────+───────┐                  │
│  │ 自动合并成功 │  │ 手动解决冲突 │                  │
│  │             │  │ → 见第3节    │                  │
│  └──────┬──────┘  └─────┬───────┘                  │
│         │               │                          │
│         └───────┬───────┘                          │
│                 v                                    │
│  Step 4: 推送到你的 GitHub 仓库                      │
│  ┌─────────────────────────────────┐                │
│  │ git push origin master          │                │
│  └─────────────────────────────────┘                │
│                                                      │
│  完成！GitHub Actions 会自动触发构建部署              │
└─────────────────────────────────────────────────────┘
```

### 1.2 逐步命令

```bash
# Step 1: 获取上游最新代码
git fetch upstream

# Step 2: 确保在 master 分支
git checkout master

# Step 3: 合并上游的 master 分支
git merge upstream/master

# Step 4: 推送到你的远程仓库
git push origin master
```

### 1.3 使用 rebase 方式（可选）

如果你希望保持提交历史线性（不产生合并提交），可以用 rebase：

```bash
git fetch upstream
git checkout master
git rebase upstream/master
git push origin master
```

> **注意：** 如果你有未推送的本地提交，rebase 后可能需要 `git push --force`。
> 对于个人仓库，force push 通常是安全的。

---

## 2. 同步前的准备

### 2.1 检查清单

```
□ 确保本地没有未提交的修改
  git status  → 应该是 "nothing to commit, working tree clean"

□ 确保本地 master 与 origin 同步
  git pull origin master

□ 查看上游有哪些新变化
  git fetch upstream
  git log master..upstream/master --oneline
  (显示上游有哪些你还没有的提交)

□ 备份重要的自定义文件（可选）
  git checkout -b backup-$(date +%Y%m%d)
  git checkout master
```

### 2.2 查看上游变化详情

```bash
# 查看上游新提交的概要
git log master..upstream/master --oneline

# 查看哪些文件被修改了
git diff master..upstream/master --stat

# 查看某个具体文件的变化
git diff master..upstream/master -- src/utils/const.ts
```

---

## 3. 冲突处理指南

### 3.1 什么时候会产生冲突？

当你和原作者修改了**同一个文件的同一部分**时，Git 无法自动合并。

**这个项目中冲突风险分析：**

```
高冲突风险的文件（你修改过的个性化配置）:
┌──────────────────────────────────────────────┐
│                                               │
│  src/static/site-metadata.ts                  │
│  └→ siteTitle, siteUrl, logo, navLinks        │
│     你修改了站点标题和链接                     │
│                                               │
│  .github/workflows/run_data_sync.yml          │
│  └→ RUN_TYPE, ATHLETE, TITLE, GITHUB_NAME     │
│     你修改了环境变量为自己的配置               │
│                                               │
│  src/static/activities.json                   │
│  └→ 你的跑步数据（每次同步都会变）             │
│     原作者的数据也在变                         │
│                                               │
│  run_page/data.db                             │
│  └→ 二进制文件，无法文本合并                   │
│                                               │
│  assets/*.svg                                 │
│  └→ 你的海报和原作者的海报不同                 │
│                                               │
└──────────────────────────────────────────────┘

低冲突风险的文件（你通常不会修改的）:
┌──────────────────────────────────────────────┐
│  src/components/**                            │
│  src/pages/**                                 │
│  src/hooks/**                                 │
│  src/utils/const.ts (如果你没自定义颜色)       │
│  run_page/*.py                                │
│  package.json / pyproject.toml                │
│  vite.config.ts                               │
└──────────────────────────────────────────────┘
```

### 3.2 解决冲突的步骤

当 `git merge upstream/master` 提示冲突时：

```bash
# 1. 查看哪些文件有冲突
git status
```

输出类似：
```
Unmerged paths:
  both modified:   src/static/site-metadata.ts
  both modified:   .github/workflows/run_data_sync.yml
```

```bash
# 2. 打开冲突文件，查找冲突标记
```

冲突文件中会有这样的标记：
```
<<<<<<< HEAD
  siteTitle: '路古在路上',           ← 你的版本
  siteUrl: 'https://quitino.github.io',
=======
  siteTitle: 'Running Page',         ← 上游版本
  siteUrl: 'https://yihong.run',
>>>>>>> upstream/master
```

**解决方法：** 保留你想要的版本，删除冲突标记：

```typescript
  siteTitle: '路古在路上',
  siteUrl: 'https://quitino.github.io',
```

### 3.3 各类文件的处理策略

| 文件 | 策略 | 说明 |
|------|------|------|
| `src/static/site-metadata.ts` | **保留你的版本** | 纯个人配置 |
| `run_data_sync.yml` | **合并：保留你的变量值 + 接受上游逻辑更新** | env 部分保留你的值，steps 部分接受上游新增/修改 |
| `src/static/activities.json` | **保留你的数据** | 下次同步会重新生成 |
| `run_page/data.db` | **保留你的数据库** | `git checkout --ours run_page/data.db` |
| `assets/*.svg` | **保留你的 SVG** | 下次同步会重新生成 |
| `src/utils/const.ts` | **接受上游 + 保留你的自定义值** | 上游可能新增常量，保留你改过的值 |
| `imported.json` | **保留你的版本** | 这是你的已导入记录 |
| **其他代码文件** | **接受上游更新** | 这是你想要的新功能和修复 |

### 3.4 快速处理二进制/数据文件冲突

```bash
# 对于二进制文件或数据文件，直接保留你的版本
git checkout --ours run_page/data.db
git checkout --ours src/static/activities.json
git checkout --ours imported.json

# 对于 SVG 海报（会自动重新生成）
git checkout --ours assets/github.svg
git checkout --ours assets/grid.svg
# ... 其他 SVG 文件

# 标记冲突已解决
git add run_page/data.db src/static/activities.json imported.json assets/
```

### 3.5 解决完冲突后

```bash
# 1. 确认所有冲突已解决
git status
# 不应再有 "Unmerged paths"

# 2. 标记冲突已解决
git add <所有冲突文件>

# 3. 完成合并
git commit
# Git 会自动生成合并提交消息

# 4. 推送
git push origin master
```

### 3.6 放弃合并（如果搞砸了）

```bash
# 合并过程中放弃（还没 commit）
git merge --abort

# 回到合并前的状态，重新来过
```

---

## 4. 多账号配置（公司电脑场景）

> 如果你的电脑全局配置的是公司 Git 账号，但这个项目需要用个人 GitHub 账号。

### 4.1 设置本项目的提交身份

```bash
cd /path/to/running_page

# 仅对本项目生效（不加 --global）
git config user.name "Quitino"
git config user.email "booofeng@163.com"

# 验证
git config user.name           # → Quitino（本项目）
git config --global user.name  # → 公司账号（不受影响）
```

### 4.2 SSH 多密钥方案（推荐）

```
原理:
┌──────────────────────────────────────────────────────┐
│  ~/.ssh/                                              │
│                                                       │
│  id_ed25519          ← 公司 SSH 密钥                  │
│  │                      绑定公司 GitHub 账号            │
│  │                      用于: git@github.com:公司/...  │
│  │                                                    │
│  id_ed25519_personal ← 个人 SSH 密钥 (新生成)          │
│                         绑定个人 GitHub 账号            │
│                         用于: git@github-personal:...  │
│                                ↑ 自定义别名             │
│                                                       │
│  config              ← SSH 配置文件                    │
│                         根据 Host 别名选择不同密钥       │
└──────────────────────────────────────────────────────┘
```

**Step 1: 生成个人 SSH 密钥**

```bash
ssh-keygen -t ed25519 -C "booofeng@163.com" -f ~/.ssh/id_ed25519_personal
```

**Step 2: 添加公钥到 GitHub**

```bash
cat ~/.ssh/id_ed25519_personal.pub
# 复制输出 → GitHub Settings → SSH keys → Add
```

**Step 3: 配置 SSH 别名**

编辑 `~/.ssh/config`：

```
# 公司 GitHub（默认）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

# 个人 GitHub（别名）
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes
```

**Step 4: 修改 remote 地址**

```bash
git remote set-url origin git@github-personal:Quitino/running_page.git
```

**Step 5: 测试**

```bash
ssh -T github-personal
# → Hi Quitino! You've been authenticated...
```

### 4.3 HTTPS + Personal Access Token（备选）

```bash
# 1. GitHub → Settings → Developer settings → Personal access tokens → 生成
# 2. 修改 remote
git remote set-url origin https://Quitino:<TOKEN>@github.com/Quitino/running_page.git
```

> 安全提醒：Token 明文存在 `.git/config` 中。SSH 方案更安全。

---

## 5. 最佳实践

### 5.1 减少冲突的建议

```
┌─────────────────────────────────────────────────────┐
│  减少冲突的策略                                       │
│                                                      │
│  1. 集中自定义配置                                    │
│     把个性化修改集中在少数文件中:                      │
│     ● site-metadata.ts (站点信息)                    │
│     ● run_data_sync.yml (环境变量部分)               │
│     尽量不改 const.ts 和其他源码                      │
│                                                      │
│  2. 不修改核心代码                                    │
│     尽量不改动 src/components/ 和 run_page/ 下的      │
│     Python 脚本，这样上游更新可以无冲突合入            │
│                                                      │
│  3. 频繁同步                                         │
│     不要等太久才同步，积累的差异越多冲突越多           │
│     建议每 1-2 个月同步一次                           │
│                                                      │
│  4. 同步前先备份                                     │
│     git stash 或 创建备份分支                         │
│     git checkout -b backup-$(date +%Y%m%d)           │
└─────────────────────────────────────────────────────┘
```

### 5.2 推荐的同步频率

```
上游更新频率    建议同步频率      原因
──────────────────────────────────────────
活跃开发期     每 2-4 周         避免积累大量差异
稳定维护期     每 1-3 个月       有新功能时同步
重大版本       立即同步          获取重要更新和 bug 修复
```

### 5.3 查看上游是否有更新

```bash
# 方法1：命令行
git fetch upstream
git log master..upstream/master --oneline
# 如果没有输出 → 已是最新

# 方法2：GitHub 网页
# 打开 https://github.com/yihong0618/running_page/commits/master
# 查看最近的提交日期
```

---

## 6. 常见问题 FAQ

### Q1: upstream remote 不存在？

```bash
# 添加 upstream
git remote add upstream https://github.com/yihong0618/running_page.git

# 验证
git remote -v
```

### Q2: merge 后发现合错了？

```bash
# 如果还没 push，回退到合并前
git reset --hard HEAD~1

# 如果已经 push，创建 revert commit
git revert -m 1 HEAD
git push
```

### Q3: 我的仓库不是通过 GitHub Fork 创建的，能用 "Sync fork" 按钮吗？

不能。GitHub 网页上的 "Sync fork" 按钮只对通过 Fork 按钮创建的仓库可用。但这**不影响**通过命令行同步——`git remote add upstream` + `git merge` 功能完全一样。

### Q4: 想建立 Fork 关系怎么办？

**方案一：重新 Fork + 迁移数据**

1. Fork 原仓库 → 得到新的 Quitino/running_page-new
2. 旧仓库改名 → running_page_backup
3. 新 Fork 改名 → running_page
4. 迁移数据文件和配置到新 Fork
5. 配置 Secrets 和 Pages

**方案二：联系 GitHub Support**

发邮件给 support@github.com 请求转换。不保证同意。

### Q5: 同步后 GitHub Actions 失败？

检查：
1. Secrets 是否存在且有效
2. 工作流文件是否在合并中被覆盖（RUN_TYPE 变回 pass）
3. Python 依赖是否有变化（requirements.txt 更新了）
