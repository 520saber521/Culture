# utils 文件夹说明

## 目录结构

```
utils/
├── helpers/           # 通用工具函数
├── api/               # API 调用封装
├── constants/         # 常量定义
├── storage/           # 本地存储管理
├── animation/         # 动画工具
├── validator/         # 验证工具
└── README.md          # 本说明文件
```

## 各模块功能说明

### 1. helpers 模块

**文件**: `helpers/index.js`

**功能**: 提供通用工具函数，包括：
- 日期格式化函数
- 字符串处理函数
- 数字处理函数
- 数组处理函数
- 防抖和节流函数
- 深拷贝函数
- 唯一 ID 生成函数
- 空值检查函数

**使用示例**:

```javascript
import { formatDate, debounce } from './helpers';

// 格式化日期
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

// 使用防抖函数
const debouncedFunc = debounce(() => {
  console.log('执行操作');
}, 1000);
```

### 2. api 模块

**文件**: `api/index.js`

**功能**: 封装 API 请求，包括：
- 基础请求方法（GET, POST, PUT, DELETE）
- 江苏文化数据相关 API
- AI 设计相关 API
- 统一错误处理

**使用示例**:

```javascript
import { culturalApi, aiApi } from './api';

// 获取历史名人列表
const celebrities = await culturalApi.getCelebritiesList({ page: 1, limit: 10 });

// 生成文化图像
const image = await aiApi.generateImage({ prompt: '江苏文化', style: '中国风' });
```

### 3. constants 模块

**文件**: `constants/index.js`

**功能**: 定义项目中使用的常量，包括：
- 路由路径常量
- 文化分类常量
- API 端点常量
- 颜色主题常量
- 动画配置常量
- 存储键名常量
- 响应式断点常量
- 页面标题常量

**使用示例**:

```javascript
import { ROUTES, COLORS } from './constants';

// 使用路由路径
router.push(ROUTES.CELEBRITIES);

// 使用颜色常量
const style = {
  backgroundColor: COLORS.PRIMARY,
  color: COLORS.ACCENT
};
```

### 4. storage 模块

**文件**: `storage/index.js`

**功能**: 封装本地存储操作，包括：
- localStorage 操作
- sessionStorage 操作
- 用户信息存储
- 设计历史存储
- 文化偏好存储

**使用示例**:

```javascript
import { userStorage, designStorage } from './storage';

// 保存用户信息
userStorage.saveUserInfo({ username: '张三', avatar: 'avatar.jpg' });

// 检查是否登录
const isLoggedIn = userStorage.isLoggedIn();

// 添加设计历史
 designStorage.addDesignHistory({ id: 1, name: '文化海报' });
```

### 5. animation 模块

**功能**: 提供动画相关工具函数，包括：
- 滚动动画辅助函数
- 元素进入视口检测
- 缓动函数定义
- 动画配置

### 6. validator 模块

**功能**: 提供验证相关工具函数，包括：
- 表单验证函数
- 数据格式验证
- 输入验证规则

## 命名规范

1. **文件命名**: 使用小写字母，单词之间用连字符 `-` 分隔
2. **函数命名**: 使用驼峰命名法，如 `formatDate`
3. **常量命名**: 使用大写字母，单词之间用下划线 `_` 分隔，如 `COLORS.PRIMARY`
4. **变量命名**: 使用驼峰命名法，如 `userInfo`

## 开发规范

1. **函数单一职责**: 每个函数只负责一个具体功能
2. **详细的 JSDoc 注释**: 每个函数都要有完整的注释
3. **错误处理**: 所有可能的错误都要进行捕获和处理
4. **测试覆盖**: 为核心函数编写单元测试，覆盖率不低于 80%
5. **代码风格**: 遵循项目的代码风格规范

## 维护指南

1. **添加新工具函数**: 在相应的模块中添加，并更新本说明文件
2. **修改现有函数**: 确保向后兼容，或在重大变更时更新版本
3. **测试**: 每次修改后运行测试，确保功能正常
4. **文档**: 保持文档与代码同步更新
