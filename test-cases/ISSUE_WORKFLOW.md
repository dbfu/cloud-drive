# Issue 提报流程

## 流程概览

```
测试执行 → 结果分析 → 收集证据 → 创建 Issue → 关联报告 → 追踪状态
```

---

## 详细步骤

### 1. 测试执行中发现缺陷

当执行测试用例时，发现实际结果与预期不一致：

| 步骤 | 内容 |
|------|------|
| 记录失败 | 在执行报告中标记状态为 `fail` |
| 分析原因 | 判断是代码缺陷还是其他原因 |
| 收集证据 | 截图、视频、日志等 |

### 2. 失败原因分析

| 类型 | 描述 | 是否创建Issue |
|------|------|---------------|
| `assertion_failed` | 断言验证失败 | ✅ 创建Bug Issue |
| `precondition_failed` | 前置条件失败 | ❌ 不创建，记录阻塞 |
| `timeout` | 超时 | ✅ 创建性能Issue |
| `unexpected_behavior` | 非预期行为 | ✅ 创建Bug Issue |
| `test_case_error` | 用例设计问题 | ❌ 更新用例，不创建Issue |
| `environment_error` | 环境问题 | ❌ 修复环境，重新执行 |

### 3. 收集证据

创建执行报告目录：
```bash
mkdir -p test-cases/{module}/{case-id}/{date}_{seq}-fail/screenshots
mkdir -p test-cases/{module}/{case-id}/{date}_{seq}-fail/videos
mkdir -p test-cases/{module}/{case-id}/{date}_{seq}-fail/logs
```

证据清单：
- 失败截图（必选）
- 失败录屏（可选）
- 错误日志（必选）
- API响应数据（必选）

### 4. 创建 GitHub Issue

使用 gh CLI 创建：

```bash
gh issue create \
  --title "[TEST-FAIL] {case-id} - {缺陷简述}" \
  --body-file test-cases/{module}/{case-id}/{date}_{seq}-fail/issue-body.md \
  --label "test-failure,bug,{priority},module:{module}" \
  --assignee @me
```

Issue Body 模板：

```markdown
## 测试用例信息

| 项目 | 内容 |
|------|------|
| 用例编号 | {case-id} |
| 用例标题 | {title} |
| 执行日期 | {date} |
| 执行批次 | {seq} |
| 测试报告 | [{date}_{seq}-fail/report.md](链接) |

---

## 缺陷描述

{详细描述缺陷现象}

---

## 复现步骤

1. {步骤1}
2. {步骤2}
3. ...

---

## 预期结果

{预期的正确行为}

---

## 实际结果

{实际发生的行为}

---

## 断言失败

| 断言 | 预期 | 实际 |
|------|------|------|
| {断言描述} | {预期值} | {实际值} |

---

## 证据

| 类型 | 文件 |
|------|------|
| 截图 | screenshots/fail.png |
| 视频 | videos/fail.webm |
| 日志 | logs/error.log |

---

## 环境

| 项目 | 内容 |
|------|------|
| 操作系统 | macOS / Windows / Linux |
| 浏览器 | Chrome 120 / Safari |
| 后端版本 | {commit hash} |
| 前端版本 | {commit hash} |
```

### 5. 关联Issue到测试报告

在测试报告 `report.md` 中添加：

```markdown
## 关联缺陷

| 项目 | 内容 |
|------|------|
| GitHub Issue | [#N](https://github.com/dbfu/cloud-drive/issues/N) |
| Issue 创建时间 | {timestamp} |
| Issue 状态 | Open |
```

### 6. 追踪Issue状态

定期查看Issue状态：
```bash
gh issue view {number} --json state,title,assignee
```

---

## Issue 标签体系

| 标签 | 用途 |
|------|------|
| `test-failure` | 测试失败发现的缺陷 |
| `bug` | 代码缺陷 |
| `P0` | 最高优先级 |
| `P1` | 高优先级 |
| `P2` | 中优先级 |
| `module:auth` | 认证模块 |
| `module:file` | 文件操作模块 |
| `module:ui` | 前端UI模块 |

---

## 注意事项

1. **确认是缺陷**：在创建Issue前，确认问题确实来自代码，而非测试用例或环境
2. **证据完整**：必须有足够证据支持缺陷描述
3. **信息清晰**：复现步骤要让开发能复现问题
4. **及时创建**：发现缺陷后尽快创建Issue，避免遗忘