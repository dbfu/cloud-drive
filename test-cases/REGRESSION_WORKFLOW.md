# 回归验证流程

## 流程概览

```
Issue Fixed → 确认修复信息 → 确定复测范围 → 执行复测 → 处理结果 → 更新状态
```

---

## 详细步骤

### 1. 监控Issue状态

定期检查待复测Issue：
```bash
# 查看所有已修复待验证的Issue
gh issue list --label fixed --state open

# 查看特定Issue详情
gh issue view {number} --json state,title,labels,comments
```

状态触发条件：
- Issue被标记为 `fixed`
- Issue评论中提及已修复
- Issue关联的PR已合并

### 2. 确认修复信息

获取修复详情：
| 信息 | 来源 |
|------|------|
| 修复内容 | Issue评论 |
| 修复代码 | PR链接 |
| 修复版本 | commit hash |
| 修复影响范围 | 开发说明 |

### 3. 确定复测范围

| 范围类型 | 说明 | 适用场景 |
|----------|------|---------|
| **最小范围** | 仅复测失败用例 | 单一功能缺陷 |
| **模块范围** | 复测相关模块全部用例 | 模块内影响 |
| **关联范围** | 复测可能受影响的用例 | 跨模块影响 |
| **全量回归** | 版本发布前全部用例 | 重大修改 |

### 4. 执行复测

创建复测报告目录：
```bash
mkdir -p test-cases/{module}/{case-id}/{date}_{seq}-regression-{pass/fail}
```

执行步骤：
| 步骤 | 内容 |
|------|------|
| 1. 按原用例执行 | 遵循YAML定义的steps |
| 2. 验证原失败断言 | 重点验证已修复部分 |
| 3. 测试边界场景 | 检查修复是否引入新问题 |
| 4. 测试关联场景 | 验证其他用例是否受影响 |

### 5. 复测通过处理

创建 `regression-pass` 报告：

```markdown
# TC-{ID} 复测报告

## 基本信息

| 项目 | 内容 |
|------|------|
| 用例编号 | TC-{ID} |
| 原失败批次 | {原批次} |
| 复测日期 | {date} |
| 复测批次 | {seq} |
| 复测结果 | ✅ 回归验证通过 |
| 关联Issue | #N |

---

## 验证内容

| 断言 | 预期 | 实际 | 结果 |
|------|------|------|------|
| {原失败断言} | {预期} | {实际} | ✅ |

---

## 结论

缺陷已修复，验证通过。
```

更新Issue：
```bash
# 评论Issue
gh issue comment {number} --body "$(cat <<EOF
## 复测通过 ✅

复测批次: {date}_{seq}-regression-pass
复测报告: [report.md](链接)

原缺陷已验证修复，无新问题发现。
EOF
)"

# 添加verified标签
gh issue edit {number} --add-label verified

# 关闭Issue
gh issue close {number} --comment "修复验证通过，Issue关闭"
```

### 6. 复测失败处理

创建 `regression-fail` 报告：

```markdown
# TC-{ID} 复测报告

## 基本信息

| 项目 | 内容 |
|------|------|
| 用例编号 | TC-{ID} |
| 原失败批次 | {原批次} |
| 复测日期 | {date} |
| 复测批次 | {seq} |
| 复测结果 | ❌ 回归验证失败 |
| 关联Issue | #N |

---

## 失败详情

| 断言 | 预期 | 实际 | 结果 |
|------|------|------|------|
| {断言} | {预期} | {实际} | ❌ |

---

## 新发现问题

{描述复测中发现的新问题}

---

## 建议

{修复建议}
```

更新Issue：
```bash
# Reopen Issue
gh issue reopen {number}

# 补充失败信息
gh issue comment {number} --body "$(cat <<EOF
## 复测失败 ❌

复测批次: {date}_{seq}-regression-fail
复测报告: [report.md](链接)

失败详情:
- 预期: {预期值}
- 实际: {实际值}

请重新检查修复代码。
EOF
)"

# 添加regression-failed标签
gh issue edit {number} --add-label regression-failed
```

---

## 复测检查清单

- [ ] 确认Issue已标记fixed
- [ ] 获取修复commit信息
- [ ] 确定复测范围
- [ ] 执行原失败用例
- [ ] 验证原失败断言
- [ ] 测试边界场景
- [ ] 测试关联场景
- [ ] 创建复测报告
- [ ] 更新Issue状态
- [ ] 更新用例index.md

---

## 注意事项

1. **复测不新建Issue**：复测失败时Reopen原Issue，不创建新Issue
2. **完整验证**：不只验证原失败点，还要检查边界和关联场景
3. **证据收集**：复测失败同样需要收集证据
4. **及时反馈**：复测完成后尽快更新Issue状态