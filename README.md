# Cloud Drive - 个人云盘系统

一个简单实用的个人云盘系统，支持文件上传、下载、预览和管理。

## 功能特性

### 核心功能
- ✅ 文件上传（支持多文件）
- ✅ 文件下载
- ✅ 新建文件夹
- ✅ 删除文件/文件夹
- ✅ 文件预览（图片、视频、文档）

### 用户系统
- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT 认证

## 技术栈

### 前端
- React 18 + Vite 5
- Tailwind CSS 3
- Zustand 4
- React Router DOM 6
- TypeScript 5

### 后端
- Fastify 4
- Prisma 5
- MySQL 8
- TypeScript 5

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置数据库

修改 `server/.env` 文件中的数据库连接信息：

```bash
DATABASE_URL="mysql://root:password@localhost:3306/cloud_drive"
```

确保 MySQL 已安装并创建数据库：
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE cloud_drive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. 初始化数据库

```bash
cd server
pnpm db:generate   # 生成 Prisma Client
pnpm db:push       # 推送 schema 到数据库
```

### 4. 启动开发服务器
```bash
pnpm dev
```

- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3000

### 单独启动
```bash
# 前端
cd web && pnpm dev

# 后端（需先配置数据库）
cd server && pnpm db:generate && pnpm dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 同时启动前后端 |
| `pnpm build` | 构建前后端 |
| `cd server && pnpm db:studio` | 打开 Prisma Studio |
| `cd server && pnpm db:migrate` | 创建迁移文件 |

## 项目结构

```
cloud-drive/
├── web/                    # 前端项目
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   └── file/       # 文件管理模块
│   │   ├── shared/         # 共享资源
│   │   │   ├── components/ # 公共组件
│   │   │   ├── hooks/      # 公共 hooks
│   │   │   ├── services/   # API 服务
│   │   │   ├── store/      # 全局状态
│   │   │   └── utils/      # 工具函数
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
│
├── server/                 # 后端项目
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   └── file/       # 文件管理模块
│   │   ├── lib/            # 库文件
│   │   │   ├── prisma.ts   # Prisma 客户端
│   │   │   └── upload.ts   # 文件上传处理
│   │   ├── shared/         # 共享资源
│   │   │   ├── middleware/ # 中间件
│   │   │   └── utils/      # 工具函数
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── uploads/                # 文件存储目录
│
├── docs/                   # 文档目录
│   ├── architecture.md     # 系统架构
│   ├── api-spec.md         # API 规范
│   ├── data-model.md       # 数据模型
│   └── tech-stack.md       # 技术栈说明
│
├── CLAUDE.md               # 项目约束
└── README.md
```

## 文件存储

文件存储在 `uploads/` 目录下，按用户隔离：

```
uploads/
├── {userId}/
│   ├── images/     # 图片
│   ├── videos/     # 视频
│   ├── documents/  # 文档
│   └── others/     # 其他文件
└── temp/           # 临时文件
```

## 支持的文件类型

### 图片
- jpg, jpeg, png, gif, webp

### 视频
- mp4, webm, mov

### 文档
- pdf, doc, docx, xls, xlsx, ppt, pptx, txt

## API 文档

详细的 API 规范请查看 [docs/api-spec.md](./docs/api-spec.md)

## 开发规范

详见 [CLAUDE.md](./CLAUDE.md)

## 许可证

MIT