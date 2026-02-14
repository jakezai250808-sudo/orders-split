# 全屋定制自动拆单系统（前端 MVP）

## 启动
```bash
pnpm install
pnpm dev
```

## 技术栈
- Vue 3 + TypeScript + Vite
- Pinia + Vue Router
- Element Plus
- axios（预留 baseURL + token 拦截器）
- ESLint + Prettier

## 页面导航
- `/orders` 订单工作台
- `/orders/:id/design` 方案与版本
- `/orders/:id/split` 自动拆单工作区
- `/packages`、`/packages/:id` 生产包与交付
- `/templates`、`/rules` 规则与模板
- `/materials`、`/hardware` 物料/五金库
- `/integrations` 系统对接
- `/settings` 系统设置（占位）

## Mock 数据
位于 `src/mock`：
- `orders.json`
- `orderDetail.json`
- `splitModels.json`
- `packages.json`
- `rules.json`
- `templates.json`
- `materials.json`
- `hardware.json`

## API 契约与调用
- 类型契约：`src/api/contracts.ts`
- axios 客户端：`src/api/client.ts`
- mock API 实现：`src/api/index.ts`

## 替换真实后端时改造点
1. 在 `src/api/index.ts` 中把 mock 数据读取替换为 `client.get/post/...`。
2. 维持 `contracts.ts` 类型不变，按后端实际字段做映射。
3. 在 `.env` 中配置 `VITE_API_BASE_URL`。
4. 保留 `client.ts` 中 token 注入和错误拦截逻辑，按鉴权体系调整。
