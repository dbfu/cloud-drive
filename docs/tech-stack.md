# 技术栈说明

## 前端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| React | 18.3 | 生态成熟、组件化开发、Hooks 简化状态管理 |
| Vite | 5.1 | 极速 HMR、ESM 原生支持、现代化构建工具 |
| Tailwind CSS | 3.4 | 原子化 CSS、快速开发、响应式友好、无需手写 CSS |
| Zustand | 4.5 | 轻量（~1KB）、无 Provider 包装、API 简洁、TypeScript 友好 |
| React Router DOM | 6.22 | 标准路由方案、声明式路由、支持懒加载 |
| TypeScript | 5.3 | 类型安全、IDE 支持好、前后端类型统一 |

## 后端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| Fastify | 4.26 | 高性能（比 Express 快 2 倍）、Schema 验证、插件系统 |
| Prisma | 5.10 | TypeScript 原生、类型安全、迁移工具、生成器模式 |
| MySQL | 8 | 最流行关系型数据库、云服务支持好、Prisma 完美支持 |
| TypeScript | 5.3 | 类型安全、前后端统一、编译时错误检查 |

## 开发工具

| 工具 | 用途 |
|------|------|
| pnpm | 包管理器（磁盘空间高效、依赖扁平化） |
| tsx | TypeScript 直接运行（开发时 watch 模式） |
| Vitest | 单元测试（Vite 原生、ESM 支持） |

## 为什么选择这套技术栈？

1. **前后端 TypeScript 统一**：类型可以在前后端共享，减少接口对接错误
2. **开发效率高**：Vite HMR 极快，Tailwind CSS 无需写 CSS，Zustand 状态管理简单
3. **生产性能好**：Fastify 高性能，Prisma 查询优化，Vite 构建产物小
4. **生态成熟**：React、MySQL、TypeScript 都是业界主流，文档和社区支持好