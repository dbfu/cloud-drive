# API 规格说明

## 基础信息

- **Base URL**: `/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

## 统一响应格式

```typescript
interface ApiResponse<T> {
  code: number      // 错误码，0 表示成功
  data: T           // 响应数据
  message: string   // 提示信息
}
```

## 分页响应格式

```typescript
interface PaginatedResponse<T> {
  code: number
  data: {
    list: T[]
    total: number
    page: number
    pageSize: number
  }
  message: string
}
```

## 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 认证失败（未登录或 token 过期） |
| 1003 | 权限不足 |
| 2001 | 用户名已存在 |
| 2002 | 用户名或密码错误 |
| 3001 | 文件不存在 |
| 3002 | 文件夹不存在 |
| 3003 | 文件名已存在 |
| 3004 | 文件类型不支持 |
| 3005 | 文件大小超限 |
| 3006 | 上传失败 |

---

## 接口列表

### 认证相关

#### POST /api/auth/register

用户注册

**请求参数**:
```json
{
  "username": "string (必填, 3-50字符)",
  "password": "string (必填, 6-100字符)"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "testuser"
  },
  "message": "注册成功"
}
```

---

#### POST /api/auth/login

用户登录

**请求参数**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": null,
      "avatar": null
    }
  },
  "message": "登录成功"
}
```

---

#### GET /api/auth/me

获取当前用户信息（需认证）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "Test User",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

---

### 文件管理相关

#### GET /api/files

获取文件列表（需认证）

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| parentId | number | 否 | 父文件夹ID，不传则获取根目录 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认50 |

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "我的文档",
        "type": "folder",
        "size": 0,
        "parentId": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "photo.jpg",
        "type": "image",
        "size": 102400,
        "mimeType": "image/jpeg",
        "parentId": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 50
  },
  "message": "success"
}
```

---

#### GET /api/files/:id

获取文件详情（需认证）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 2,
    "name": "photo.jpg",
    "type": "image",
    "size": 102400,
    "path": "/uploads/1/images/photo.jpg",
    "mimeType": "image/jpeg",
    "parentId": null,
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

---

#### POST /api/files/upload

上传文件（需认证）

**请求**:
- Content-Type: `multipart/form-data`
- 字段: `file` (文件)
- 字段: `parentId` (可选，父文件夹ID)

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 3,
    "name": "document.pdf",
    "type": "document",
    "size": 204800,
    "mimeType": "application/pdf",
    "parentId": null
  },
  "message": "上传成功"
}
```

---

#### POST /api/files/folder

创建文件夹（需认证）

**请求参数**:
```json
{
  "name": "string (必填, 文件夹名)",
  "parentId": "number (可选, 父文件夹ID)"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 4,
    "name": "新文件夹",
    "type": "folder",
    "parentId": null
  },
  "message": "创建成功"
}
```

---

#### DELETE /api/files/:id

删除文件或文件夹（需认证）

**说明**:
- 删除文件夹时会递归删除所有子文件和子文件夹
- 文件会从存储中删除

**响应示例**:
```json
{
  "code": 0,
  "data": null,
  "message": "删除成功"
}
```

---

#### GET /api/files/:id/download

下载文件（需认证）

**响应**:
- 文件流，Content-Type 为文件 MIME 类型
- Content-Disposition 包含文件名

---

#### GET /api/files/:id/preview

预览文件（需认证）

**说明**:
- 图片: 直接返回图片流
- 视频: 返回视频流（支持 Range 请求）
- 文档: 返回文档内容或预览信息

**响应**:
- 图片/视频: 文件流
- 文档: 预览数据

---

#### PATCH /api/files/:id/rename

重命名文件或文件夹（需认证）

**请求参数**:
```json
{
  "name": "string (必填, 新名称)"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "新名称"
  },
  "message": "重命名成功"
}
```

---

#### POST /api/files/:id/move

移动文件或文件夹（需认证）

**请求参数**:
```json
{
  "targetId": "number (目标文件夹ID，null表示移动到根目录)"
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "parentId": 2
  },
  "message": "移动成功"
}
```

---

## 健康检查

#### GET /api/health

服务健康检查

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

---

#### GET /api/ready

服务就绪检查（包含数据库连接状态）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "status": "ready",
    "database": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "success"
}
```

---

## 请求规范

### 认证请求头

需要认证的接口必须在请求头携带 JWT Token：

```
Authorization: Bearer <token>
```

### Content-Type

- POST/PUT/PATCH 请求使用 JSON 格式：`application/json`
- 文件上传使用：`multipart/form-data`

---

## 文件上传限制

| 配置项 | 限制 |
|--------|------|
| 单文件大小 | 100MB |
| 支持的图片格式 | jpg, jpeg, png, gif, webp |
| 支持的视频格式 | mp4, webm, mov |
| 支持的文档格式 | pdf, doc, docx, xls, xlsx, ppt, pptx, txt |

---

## 错误响应示例

```json
{
  "code": 1001,
  "data": null,
  "message": "文件名不能为空"
}
```

```json
{
  "code": 3001,
  "data": null,
  "message": "文件不存在"
}
```