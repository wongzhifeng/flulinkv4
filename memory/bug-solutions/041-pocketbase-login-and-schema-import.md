# 041 - PocketBase 登录与 Schema 导入问题

日期: 2025-10-14

## 问题
- 登录失败与环境变量未配置有关（`PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD`）。
- 需要快速、稳定的表结构导入方式。

## 解决
- 在 Zeabur Dashboard 设置并保存环境变量，重启服务。
- 提供 `pocketbase/schema.json` 与导入指南（管理面板/CLI/Zeabur AI 三选一）。

## 结果
- 登录问题已定位并有复用性的解决路径。
- Schema 文件已准备，可随时导入。

## 后续
- 完成导入后进行 CRUD 冒烟测试与权限/索引校验。

