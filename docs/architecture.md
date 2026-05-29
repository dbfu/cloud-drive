# 系统架构

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户端                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     浏览器                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Pages     │  │  Components │  │   Hooks     │  │   │
│  │  │  (页面)     │  │  (组件)     │  │  (状态)     │  │   │
│  │  │  - 登录页   │  │  - 文件列表 │  │  - 文件操作 │  │   │
│  │  │  - 文件管理 │  │  - 文件预览 │  │  - 用户状态 │  │   │
│  │  │  - 预览页   │  │  - 上传组件 │  │             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │   Store     │  │  Services   │                   │   │
│  │  │ (Zustand)   │  │  (API调用)  │                   │   │
│  │  └─────────────┘  └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         React 18 + Vite 5                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API + 文件上传
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         服务端                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Fastify 4                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Routes    │  │ Controllers │  │ Middleware  │  │   │
│  │  │  (路由)     │  │  (控制器)   │  │  (中间件)   │  │   │
│  │  │  - /auth    │  │  - auth.ts  │  │  - JWT     │  │   │
│  │  │  - /files   │  │  - file.ts  │  │  - 上传    │  │   │
│  │  │  - /upload  │  │              │  │  - 限流    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │                Services                      │    │   │
│  │  │               (业务逻辑)                     │    │   │
│  │  │  - AuthService: 登录/注册                    │    │   │
│  │  │  - FileService: 文件CRUD、预览               │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              Prisma Client                   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
┌──────────────────┐  ┌─────────────┐  ┌─────────────┐
│     MySQL 8      │  │  文件存储   │  │  临时目录   │
│  ┌────────────┐  │  │  uploads/   │  │  temp/      │
│  │   users    │  │  │             │  │             │
│  │   files    │  │  │  - 图片     │  │  - 上传中   │
│  └────────────┘  │  │  - 视频     │  │  - 处理中   │
└──────────────────┘  │  - 文档     │  └─────────────┘
                      └─────────────┘
```

## 模块划分

### 前端模块结构

```
src/
├── modules/
│   ├── auth/              # 认证模块
│   │   ├── pages/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── components/
│   │   └── hooks/
│   │       └── use-auth.ts
│   │
│   └── file/              # 文件管理模块
│       ├── pages/
│       │   └── file-manager.tsx
│       ├── components/
│       │   ├── file-list.tsx
│       │   ├── file-item.tsx
│       │   ├── folder-item.tsx
│       │   ├── upload-modal.tsx
│       │   ├── preview/
│       │   │   ├── image-preview.tsx
│       │   │   ├── video-preview.tsx
│       │   │   └── document-preview.tsx
│       │   └── breadcrumb.tsx
│       └── hooks/
│           ├── use-file-list.ts
│           └── use-upload.ts
│
├── shared/
│   ├── components/
│   │   ├── layout.tsx
│   │   ├── button.tsx
│   │   ├── modal.tsx
│   │   └── loading.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth-service.ts
│   │   └── file-service.ts
│   ├── store/
│   │   ├── auth-store.ts
│   │   └── file-store.ts
│   └── utils/
│       ├── file.ts
│       └── format.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

### 后端模块结构

```
src/
├── modules/
│   ├── auth/              # 认证模块
│   │   ├── routes.ts      # 路由定义
│   │   ├── controller.ts  # 控制器
│   │   ├── service.ts      # 业务逻辑
│   │   └── types.ts       # 类型定义
│   │
│   └── file/              # 文件管理模块
│       ├── routes.ts
│       ├── controller.ts
│       ├── service.ts
│       └── types.ts
│
├── lib/
│   ├── prisma.ts          # Prisma 客户端
│   └── upload.ts          # 文件上传处理
│
├── shared/
│   ├── middleware/
│   │   ├── auth.ts        # JWT 认证中间件
│   │   └── upload.ts      # 文件上传中间件
│   └── utils/
│       ├── jwt.ts
│       ├── password.ts
│       └── file.ts
│
├── app.ts
└── server.ts
```

## 功能模块说明

### 1. 认证模块 (Auth)

**功能**：
- 用户注册
- 用户登录
- JWT Token 管理

**API**：
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 2. 文件管理模块 (File)

**功能**：
- 文件列表（支持文件夹导航）
- 文件上传（支持多文件、大文件）
- 文件下载
- 新建文件夹
- 删除文件/文件夹
- 文件预览（图片、视频、文档）

**API**：
- `GET /api/files` - 获取文件列表
- `GET /api/files/:id` - 获取文件详情
- `POST /api/files/upload` - 上传文件
- `POST /api/files/folder` - 创建文件夹
- `DELETE /api/files/:id` - 删除文件/文件夹
- `GET /api/files/:id/download` - 下载文件
- `GET /api/files/:id/preview` - 预览文件

## 数据流

### 文件上传流程

```
用户选择文件 → 前端分片/直接上传 → Fastify 接收
     ↓
Multipart 解析 → 临时存储 → 类型检测
     ↓
FileService 处理 → 移动到 uploads/ 目录 → 数据库记录
     ↓
返回文件信息 → 前端更新列表
```

### 文件预览流程

```
用户点击预览 → 前端请求 /preview/:id
     ↓
JWT 验证 → 权限检查
     ↓
FileService 读取文件类型
     ↓
图片/视频: 返回文件流
文档: 转换/直接返回
     ↓
前端渲染预览组件
```

## 文件存储结构

```
uploads/
├── {userId}/
│   ├── images/
│   │   ├── xxx.jpg
│   │   └── xxx.png
│   ├── videos/
│   │   └── xxx.mp4
│   ├── documents/
│   │   ├── xxx.pdf
│   │   └── xxx.docx
│   └── others/
│       └── xxx.zip
└── temp/           # 临时文件，定期清理
```

## 安全设计

1. **认证安全**：
   - JWT Token 认证
   - 密码 bcrypt 加密
   - Token 过期机制

2. **文件安全**：
   - 文件类型白名单
   - 文件大小限制
   - 用户隔离存储
   - 文件名唯一化

3. **接口安全**：
   - 接口限流
   - 参数校验
   - XSS 防护
   - CORS 配置