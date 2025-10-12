# FluLink项目记忆总纲
**最后更新时间**：2025-01-12 (用户认证系统开发完成)
**当前版本**：MVP 1.0.0
**AI Agent**：Claude Code + Cursor协作

## 核心决策记录
### 哲学基础
- [x] 无为而治架构设计 ✅ (philosophy-decisions/001.md)
- [x] 家国双隐喻实现 ✅ (philosophy-decisions/002.md)  
- [x] 传播算法哲学映射 ✅ (philosophy-decisions/003.md)

### 技术架构
- [x] Bun运行时选型 ✅ (technical-decisions/001.md)
- [x] Solid.js响应式方案 ✅ (technical-decisions/002.md)
- [x] Turso边缘数据库 ✅ (technical-decisions/003.md)

## 当前开发重点
**本周任务**：用户认证系统开发完成
- 文件：feature-context/current-task.md
- 负责人：Claude Code（认证系统） + Cursor（API测试）
- 进度：100%（用户认证系统完整实现，JWT、密码安全、API端点、权限中间件全部完成）

## 下一阶段任务
**本周任务**：性能优化和前端集成
- 文件：feature-context/performance-optimization.md
- 负责人：Claude Code（性能优化） + Cursor（前端集成）
- 进度：0%（准备开始）

## AI协作规则
1. **会话开始必读**：memory.md + 当前任务对应上下文文件
2. **会话结束必写**：更新进度 + 记录关键决策
3. **冲突解决**：哲学一致性 > 技术最优解

## 项目状态
- **架构重构**：100% ✅
- **核心服务迁移**：100% ✅
- **API端点测试**：100% ✅
- **前端功能集成**：100% ✅
- **毒株管理功能**：100% ✅
- **前端功能测试**：100% ✅
- **地理传播算法API**：100% ✅
- **错误处理**：100% ✅
- **部署配置**：100% ✅ (Zeabur Cursor扩展直接部署)
- **Turso数据库集成**：100% ✅ (Schema设计完成，云端部署成功，构建错误已修复，连接和迁移API完全修复)
- **用户认证系统**：100% ✅ (JWT令牌管理、密码安全、认证API、权限中间件、数据库集成全部完成)
- **性能优化**：0% ⏳

## 重要提醒
- 所有代码必须对应《德道经》依据
- 严格遵循Bun+SolidStart+Turso技术栈
- 优先考虑边缘计算和性能优化
- 保持AI记忆库的完整性和一致性
- 技术问题必须按调试规则处理

## 🌍 世界规则（不可违反）
- **禁止本地测试环境**：不安装Bun/Node.js本地开发环境
- **强制云端开发**：所有测试和验证必须在Zeabur服务器进行
- **零依赖安装**：不安装任何本地依赖包或工具
- **云端优先**：代码编写 → 提交Git → Zeabur自动部署 → 云端测试
- **边缘计算测试**：所有功能测试通过Zeabur边缘节点验证

## 技术问题调试规则
- [x] 建立调试规则文档 ✅ (bug-solutions/debugging-rules.md)
- [x] 记录SolidStart JSX语法错误解决方案 ✅ (bug-solutions/001-solidstart-jsx-syntax-error.md)
- [x] 记录SolidStart构建配置错误解决方案 ✅ (bug-solutions/002-solidstart-build-config-error.md)
- [x] 记录SolidStart项目结构不完整解决方案 ✅ (bug-solutions/003-solidstart-project-structure-incomplete.md)
- [x] 记录SolidStart路由配置错误解决方案 ✅ (bug-solutions/004-solidstart-router-config-error.md)
- [x] 记录SolidStart部署失败综合解决方案 ✅ (bug-solutions/005-solidstart-deployment-failure-comprehensive.md)
- [x] 记录SolidStart vinxi构建失败解决方案 ✅ (bug-solutions/006-solidstart-vinxi-build-failure.md)
- [x] 记录SolidStart依赖版本不匹配解决方案 ✅ (bug-solutions/007-solidstart-dependency-version-mismatch.md)
- [x] 记录SolidStart命令不存在解决方案 ✅ (bug-solutions/008-solidstart-command-not-found.md)
- [x] 记录API端点功能不完整解决方案 ✅ (bug-solutions/009-api-endpoint-functionality-incomplete.md)
- [x] 记录Bun构建失败async/await语法错误解决方案 ✅ (bug-solutions/010-bun-async-await-syntax-error.md)
- [x] 记录FluLink项目部署成功解决方案 ✅ (bug-solutions/011-flulink-deployment-success.md)
- [x] 记录前端按钮无法点击问题解决方案 ✅ (bug-solutions/012-frontend-button-click-issue.md)
- [x] 记录FluLink项目部署成功解决方案 ✅ (bug-solutions/013-frontend-button-click-success.md)
- [x] 记录Bun构建失败模板字符串语法错误解决方案 ✅ (bug-solutions/014-bun-template-string-syntax-error.md)
- [x] 记录Bun构建失败模板字符串语法错误解决方案（续） ✅ (bug-solutions/015-bun-template-string-syntax-error-continued.md)
- [x] 记录前端按钮点击无反应问题解决方案 ✅ (bug-solutions/016-frontend-button-click-no-response.md)
- [x] 记录新部署页面502错误解决方案 ✅ (bug-solutions/017-deployment-502-error.md)
- [x] 记录界面美化但点击无反应问题解决方案 ✅ (bug-solutions/018-interface-beautified-but-no-click.md)
- [x] 记录浏览器位置获取失败问题解决方案 ✅ (bug-solutions/019-browser-location-failure.md)
- [x] 记录毒株感染和传播任务创建失败问题解决方案 ✅ (bug-solutions/020-strain-infection-propagation-failure.md)
- [x] 记录创建毒株无交互问题解决方案 ✅ (bug-solutions/021-create-strain-no-interaction.md)
- [x] 记录Bun构建失败Invalid assignment target解决方案 ✅ (bug-solutions/022-bun-invalid-assignment-target.md)
- [x] 记录查询附近传播失败和创建毒株缺少交互问题解决方案 ✅ (bug-solutions/023-nearby-propagation-failure.md)
- [x] 记录查询附近传播失败API请求方式不匹配解决方案 ✅ (bug-solutions/024-nearby-propagation-api-mismatch.md)
- [x] 记录查询附近传播失败API方法不存在解决方案 ✅ (bug-solutions/025-nearby-propagation-method-not-found.md)
- [x] 记录服务器监听配置问题容器环境网络接口监听解决方案 ✅ (bug-solutions/026-container-hostname-config.md)
- [x] 记录32位架构Turso兼容性问题解决方案 ✅ (bug-solutions/027-turso-32bit-compatibility.md)
- [x] 记录部署失败ReferenceError User not defined解决方案 ✅ (bug-solutions/028-reference-error-user-not-defined.md)
- [x] 记录drizzle-orm boolean导入错误解决方案 ✅ (bug-solutions/032-drizzle-orm-boolean-import-error.md)
- [x] 记录DatabaseService导入错误解决方案 ✅ (bug-solutions/033-database-service-import-error.md)
- [x] 记录Turso客户端API调用方式错误解决方案 ✅ (bug-solutions/034-turso-client-api-error.md)
- [x] 记录Turso数据库连接测试修复解决方案 ✅ (bug-solutions/035-turso-connection-test-fix.md)
- [x] 记录Turso数据库连接和迁移API完全修复解决方案 ✅ (bug-solutions/036-turso-complete-fix.md)
- [x] 记录用户认证系统完整实现解决方案 ✅ (bug-solutions/037-user-authentication-system-complete.md)
- [ ] 建立问题分类和严重程度评估标准 🔄 (进行中)
- [ ] 完善预防措施和最佳实践 🔄 (进行中)