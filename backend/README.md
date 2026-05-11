# 江苏文化传承与创新平台 - 后端服务

基于 Spring Boot 3.2 的 Java 后端架构，采用分层设计原则，实现松耦合和高内聚。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.0 | 基础框架 |
| Spring Security | 6.x | 安全认证框架 |
| MyBatis-Plus | 3.5.5 | ORM框架 |
| MySQL | 8.0+ | 数据库 |
| Redis | 7.0+ | 缓存 |
| JWT | 0.12.3 | Token认证 |
| Knife4j | 4.4.0 | API文档 |
| Hutool | 5.8.24 | 工具类库 |

## 项目结构

```
backend/
├── src/main/java/com/cultural/
│   ├── common/                 # 通用模块
│   │   ├── annotation/         # 自定义注解
│   │   ├── aspect/             # AOP切面
│   │   ├── constant/           # 常量定义
│   │   ├── exception/          # 异常处理
│   │   ├── response/           # 统一响应
│   │   └── util/               # 工具类
│   ├── config/                 # 配置类
│   ├── controller/             # 控制器层
│   ├── dto/                    # 数据传输对象
│   ├── entity/                 # 实体类
│   ├── mapper/                 # 数据访问层
│   ├── security/               # 安全模块
│   ├── service/                # 服务层
│   │   └── impl/               # 服务实现
│   ├── vo/                     # 视图对象
│   └── CulturalApplication.java
└── src/main/resources/
    ├── application.yml         # 配置文件
    └── db/init.sql             # 数据库初始化脚本
```

## 核心功能

### 1. 统一响应格式
```java
Result<T> {
    Integer code;      // 状态码
    String message;    // 提示信息
    T data;            // 数据
    Long timestamp;    // 时间戳
}
```

### 2. 全局异常处理
- BusinessException: 业务异常
- TokenException: Token异常
- 参数校验异常自动处理
- HTTP状态码异常处理

### 3. JWT认证
- Token生成与验证
- Token过期处理
- 用户信息存储

### 4. 日志系统
- AOP切面日志
- 请求参数记录
- 响应结果记录
- 异常日志记录

### 5. 缓存策略
- Redis缓存
- Spring Cache注解
- 自动缓存失效

## API接口

### 认证模块 `/api/auth`
| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /login | POST | 用户登录 | 否 |
| /register | POST | 用户注册 | 否 |
| /logout | POST | 用户登出 | 是 |
| /info | GET | 获取用户信息 | 是 |
| /info | PUT | 更新用户信息 | 是 |
| /password | PUT | 修改密码 | 是 |

### 非遗模块 `/api/heritage`
| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /list | GET | 获取非遗列表 | 否 |
| /detail/{id} | GET | 获取非遗详情 | 否 |
| /like/{id} | POST | 点赞 | 否 |

### 新闻模块 `/api/news`
| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /list | GET | 获取新闻列表 | 否 |
| /detail/{id} | GET | 获取新闻详情 | 否 |

### 名人模块 `/api/celebrities`
| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /list | GET | 获取名人列表 | 否 |
| /detail/{id} | GET | 获取名人详情 | 否 |

### 传统艺术模块 `/api/traditional-arts`
| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /list | GET | 获取艺术列表 | 否 |
| /detail/{id} | GET | 获取艺术详情 | 否 |

### 作品模块 `/api/works`
| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /list | GET | 获取公开作品 | 否 |
| /my | GET | 获取我的作品 | 是 |
| /detail/{id} | GET | 获取作品详情 | 否 |
| / | POST | 创建作品 | 是 |
| / | PUT | 更新作品 | 是 |
| /{id} | DELETE | 删除作品 | 是 |
| /like/{id} | POST | 点赞 | 否 |

## 快速开始

### 1. 环境准备
- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 7.0+

### 2. 数据库配置
```sql
-- 执行初始化脚本
source src/main/resources/db/init.sql
```

### 3. 修改配置
编辑 `application.yml`，配置数据库和Redis连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cultural_db
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
```

### 4. 启动项目
```bash
mvn spring-boot:run
```

### 5. 访问API文档
http://localhost:8080/api/doc.html

## 使用示例

### 用户登录
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 获取非遗列表
```bash
curl http://localhost:8080/api/heritage/list?pageNum=1&pageSize=10
```

### 创建作品（需认证）
```bash
curl -X POST http://localhost:8080/api/works \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "我的设计作品",
    "description": "基于南京云锦元素的设计",
    "imageUrl": "https://example.com/image.jpg",
    "style": "中国风",
    "culturalElement": "南京云锦"
  }'
```

## 扩展指南

### 添加新模块

1. 创建实体类 `entity/Xxx.java`
2. 创建Mapper `mapper/XxxMapper.java`
3. 创建DTO `dto/XxxDTO.java`
4. 创建VO `vo/XxxVO.java`
5. 创建Service接口 `service/XxxService.java`
6. 创建Service实现 `service/impl/XxxServiceImpl.java`
7. 创建Controller `controller/XxxController.java`

### 添加缓存
```java
@Cacheable(value = "cacheName", key = "#id")
public XxxVO getById(Long id) { ... }

@CacheEvict(value = "cacheName", key = "#id")
public void update(XxxDTO dto) { ... }
```

### 添加日志
```java
@Log(value = "操作描述", module = "模块名", operation = "操作名")
public void someMethod() { ... }
```

## 注意事项

1. **JWT密钥**: 生产环境请修改 `jwt.secret` 配置
2. **数据库密码**: 生产环境请使用强密码
3. **Redis密码**: 生产环境建议启用Redis密码
4. **CORS配置**: 生产环境请限制允许的域名
