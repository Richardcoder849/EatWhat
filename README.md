# 吃什么？🍽️

家庭菜谱安卓应用 — 记录你的家常菜，不知道吃什么时让 AI 帮你决定。

## 功能

- **菜谱管理** — 添加、编辑、删除菜谱，支持分类、食材、步骤和图片
- **AI 智能推荐** — 接入 OpenAI 兼容 API，根据你的食材和心情推荐菜品
- **图片支持** — 拍照或从相册选择菜品图片
- **搜索与筛选** — 按菜名/食材搜索，按分类筛选
- **磨砂玻璃 UI** — 草绿色 Apple 风格磨砂玻璃设计

## 技术栈

- **React Native** (Expo SDK 54)
- **TypeScript**
- **expo-sqlite** (原生) / **localStorage** (Web 预览)
- **@react-navigation/native** (底部标签 + 原生栈导航)
- **expo-image-picker** (拍照/相册)
- **EAS Build** (APK 构建)

## 构建 APK

```bash
npm install
npx eas build --profile preview --platform android
```

## 本地开发

```bash
npm install
npx expo start
```

Web 预览: 按 `w` 键

## 项目结构

```
src/
├── components/    # 可复用组件 (GlassCard, RecipeCard)
├── data/          # 种子数据
├── database/      # SQLite + Web 存储
├── navigation/    # 路由导航
├── screens/       # 页面 (首页/列表/AI/设置/编辑)
├── services/      # 业务逻辑 (菜谱 CRUD, AI 服务)
├── theme/         # 设计 token
└── types/         # TypeScript 类型
```

## License

MIT
