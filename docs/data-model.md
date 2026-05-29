# 数据模型定义

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 模型定义

### User（用户）

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(50)
  password  String   @db.VarChar(255)
  nickname  String?  @db.VarChar(100)
  avatar    String?  @db.VarChar(500)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  files     File[]

  @@map("users")
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Int | 是 | 主键，自增 |
| username | String(50) | 是 | 用户名，唯一 |
| password | String(255) | 是 | 密码（bcrypt 加密） |
| nickname | String(100) | 否 | 昵称 |
| avatar | String(500) | 否 | 头像URL |
| createdAt | DateTime | 是 | 创建时间 |
| updatedAt | DateTime | 是 | 更新时间 |

---

### File（文件/文件夹）

```prisma
model File {
  id        Int      @id @default(autoincrement())
  name     String   @db.VarChar(255)
  type     String   @db.VarChar(50)
  size     Int      @default(0)
  path     String   @db.VarChar(1000)
  mimeType String?  @db.VarChar(100)
  parentId Int?     @map("parent_id")
  userId   Int      @map("user_id")
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent   File?    @relation("FileTree", fields: [parentId], references: [id], onDelete: Cascade)
  children File[]   @relation("FileTree")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([parentId])
  @@index([userId, parentId])
  @@map("files")
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Int | 是 | 主键，自增 |
| name | String(255) | 是 | 文件名/文件夹名 |
| type | String(50) | 是 | 类型：folder, image, video, document, other |
| size | Int | 是 | 文件大小（字节），文件夹为0 |
| path | String(1000) | 是 | 存储路径（相对路径） |
| mimeType | String(100) | 否 | MIME类型 |
| parentId | Int | 否 | 父文件夹ID，根目录为null |
| userId | Int | 是 | 所属用户ID |
| createdAt | DateTime | 是 | 创建时间 |
| updatedAt | DateTime | 是 | 更新时间 |

---

## 文件类型说明

### type 字段枚举值

| 值 | 说明 | MIME类型示例 |
|-----|------|-------------|
| folder | 文件夹 | - |
| image | 图片 | image/jpeg, image/png, image/gif, image/webp |
| video | 视频 | video/mp4, video/webm, video/quicktime |
| document | 文档 | application/pdf, application/msword, text/plain |
| other | 其他 | 其他所有类型 |

---

## 关系说明

### User 与 File 的关系

```
User (1) ──< (N) File

一个用户可以有多个文件
一个文件属于一个用户
删除用户时级联删除所有文件
```

### File 自关联（文件夹层级结构）

```
File (parent) (0..1) ──< (N) File (children)

一个文件夹可以有多个子文件/子文件夹
一个文件/文件夹只能有一个父文件夹
根目录的文件 parentId 为 null
删除文件夹时级联删除所有子项
```

---

## 索引设计

| 表 | 索引 | 类型 | 说明 |
|-----|------|------|------|
| files | userId | 普通索引 | 按用户查询 |
| files | parentId | 普通索引 | 按父文件夹查询 |
| files | userId + parentId | 复合索引 | 查询用户某文件夹下的内容 |

---

## 命名规范

| 规范 | 示例 |
|------|------|
| Model 命名 | PascalCase：`User`、`File` |
| 字段命名 | camelCase：`createdAt`、`userId` |
| 数据库列名 | snake_case：`created_at`、`user_id`（使用 `@map`） |
| 表名 | snake_case：`users`、`files`（使用 `@@map`） |

---

## ER 图

```
┌─────────────────┐
│      users      │
├─────────────────┤
│ id (PK)         │
│ username (UQ)   │
│ password        │
│ nickname        │
│ avatar          │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│     files       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ type            │
│ size            │
│ path            │
│ mime_type       │
│ parent_id (FK)  │──┐
│ user_id (FK)    │  │
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
         ▲           │
         │           │
         └───────────┘
          自关联 (层级结构)
```

---

## 数据示例

### 用户数据

```sql
INSERT INTO users (id, username, password, nickname, created_at, updated_at)
VALUES (1, 'testuser', '$2b$10$...', 'Test User', NOW(), NOW());
```

### 文件夹数据

```sql
INSERT INTO files (name, type, size, path, parent_id, user_id, created_at, updated_at)
VALUES ('我的文档', 'folder', 0, '/uploads/1/', NULL, 1, NOW(), NOW());
```

### 文件数据

```sql
INSERT INTO files (name, type, size, path, mime_type, parent_id, user_id, created_at, updated_at)
VALUES ('photo.jpg', 'image', 102400, '/uploads/1/images/photo.jpg', 'image/jpeg', NULL, 1, NOW(), NOW());
```

---

## 查询示例

### 获取用户根目录文件列表

```typescript
const files = await prisma.file.findMany({
  where: {
    userId: 1,
    parentId: null
  },
  orderBy: [
    { type: 'asc' },  // 文件夹在前
    { createdAt: 'desc' }
  ]
});
```

### 获取文件夹下所有内容（递归）

```typescript
async function getAllChildren(folderId: number): Promise<File[]> {
  const children = await prisma.file.findMany({
    where: { parentId: folderId }
  });

  const result: File[] = [...children];
  for (const child of children) {
    if (child.type === 'folder') {
      const subChildren = await getAllChildren(child.id);
      result.push(...subChildren);
    }
  }
  return result;
}
```

### 计算用户存储空间使用量

```typescript
const totalSize = await prisma.file.aggregate({
  where: {
    userId: 1,
    type: { not: 'folder' }
  },
  _sum: {
    size: true
  }
});
```