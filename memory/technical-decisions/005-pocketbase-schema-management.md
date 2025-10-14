# 技术决策 005 - PocketBase Schema 管理

日期: 2025-10-14

## 决策
- 使用单一来源的 JSON Schema 文件 `pocketbase/schema.json` 管理全部数据表结构。
- 优先通过 Zeabur 控制台（或其 AI 助手）执行导入，保证生产环境一致性。

## 背景
- 需要快速、可重复地在生产 PocketBase 上创建/更新数据表结构。
- 需支撑 AI-Native 字段（向量/JSON）与关系、权限、索引等完整配置。

## 方案要点
- schema.json 包含 4 个集合及其字段、索引、权限。
- 以管理面板 Import 为主；CLI 为备选；Zeabur AI 为推荐。

## 取舍
- 放弃在应用代码中硬编码迁移脚本，降低前后端耦合度，提升平台化管理效率。

## 影响
- 开发/运维通过同一 JSON 源管理，降低配置漂移风险。
- 引入变更需审阅 schema.json PR，便于审计与回滚。

