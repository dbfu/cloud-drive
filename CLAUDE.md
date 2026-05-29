# 项目约束

## 技术栈

### 前端
- 框架：React 18 + Vite 5
- 样式：Tailwind CSS 3
- 状态管理：Zustand 4
- 路由：React Router DOM 6
- 语言：TypeScript 5
- 包管理：pnpm（必须）

### 后端
- 框架：Fastify 4
- ORM：Prisma 5
- 数据库：MySQL 8
- 语言：TypeScript 5
- 包管理：pnpm（必须）

## 代码规范
- 语言：TypeScript（禁止 JavaScript）
- 每个组件不超过 500 行（超过必须拆分）
- 文件命名：kebab-case（如 `record-list.tsx`）
- 目录结构：按功能模块划分

## API 规范
- 风格：RESTful
- 认证：JWT（Bearer Token）
- Token 存储：前端 localStorage 或 Authorization header
- 响应格式：{ code: number, data: any, message: string }
- 错误码定义：
  - 0: 成功
  - 1001: 参数错误
  - 1002: 认证失败
  - 1003: 权限不足
  - 2001+: 业务错误码

## Prisma 规范
- model 命名：PascalCase（如 User、Record）
- 字段命名：camelCase（如 createdAt）
- 数据库列名：snake_case（使用 @map）
- 必须定义 createdAt 和 updatedAt

## 禁止事项
- 禁止使用 npm 或 yarn 安装依赖
- 禁止在组件中直接调用 API（必须通过 service）
- 禁止在后端 controller 中写业务逻辑（必须放在 service）
- 禁止硬编码配置（必须使用环境变量）
- 禁止前端存储敏感信息
- 禁止跳过 TypeScript 类型检查