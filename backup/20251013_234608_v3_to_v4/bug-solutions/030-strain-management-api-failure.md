# 解决方案：毒株管理功能失败 - API方法调用错误

## 问题描述
- **问题现象1**：感染失败 - 感染失败
- **问题现象2**：创建传播任务失败 - 传播任务创建失败
- **问题环境**：https://flulink-v2.zeabur.app/
- **问题时间**：2025-01-12

## 根本原因分析
1. **API方法调用错误** - GeographicPropagationAPI中调用了不存在的方法
2. **代码版本不同步** - 本地修复的代码还没有部署到Zeabur
3. **服务方法不匹配** - API调用的方法名与实际服务方法名不一致

## 解决方案
### 1. 修复感染API方法调用
- **问题**：`this.propagationService.infectUser is not a function`
- **原因**：方法名错误，应该是`processUserInfection`
- **修复**：
  ```typescript
  // 修复前（错误）
  const infectionResult = await this.propagationService.infectUser(
    infectionParams.userId || 'anonymous',
    strainId,
    userLocation.lat,
    userLocation.lng
  );
  
  // 修复后（正确）
  const infectionResult = await this.propagationService.processUserInfection(
    infectionParams.userId || 'anonymous',
    strainId,
    userLocation.lat,
    userLocation.lng
  );
  ```

### 2. 修复传播任务创建API方法调用
- **问题**：`this.strainService.getStrainById is not a function`
- **原因**：方法不存在，应该使用`getAllActiveStrains`然后过滤
- **修复**：
  ```typescript
  // 修复前（错误）
  const strain = await this.strainService.getStrainById(strainId);
  if (!strain) {
    throw new Error('毒株不存在');
  }
  
  // 修复后（正确）
  const strains = await this.strainService.getAllActiveStrains();
  const strain = strains.find(s => s.id === strainId);
  if (!strain) {
    throw new Error('毒株不存在');
  }
  ```

### 3. 前端API调用验证
- **感染API调用**：✅ 正确
  ```javascript
  const response = await fetch('/api/propagation/infect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userLocation: userLocation,
      strainId: strainId,
      infectionParams: { userId: 'user_' + Date.now() }
    })
  });
  ```
  
- **传播任务创建API调用**：✅ 正确
  ```javascript
  const response = await fetch('/api/propagation/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      strainId: strainId,
      userLocation: userLocation,
      propagationParams: { radius: 1000 }
    })
  });
  ```

## 技术细节
### 修复的文件
- `src/server/services/GeographicPropagationAPI.ts` - 主要修复文件

### 修复内容
1. **infectUser方法调用修复** - 使用正确的`processUserInfection`方法
2. **getStrainById方法调用修复** - 使用`getAllActiveStrains`然后过滤
3. **错误处理完善** - 保持原有的错误处理逻辑

### 修复前后对比
```typescript
// 修复前（导致错误）
const infectionResult = await this.propagationService.infectUser(...);
const strain = await this.strainService.getStrainById(strainId);

// 修复后（正确）
const infectionResult = await this.propagationService.processUserInfection(...);
const strains = await this.strainService.getAllActiveStrains();
const strain = strains.find(s => s.id === strainId);
```

## 预防措施
1. **方法名验证** - 确保调用的方法在目标服务中存在
2. **API测试** - 修复后立即进行API测试
3. **代码同步** - 确保本地修复的代码及时部署
4. **错误监控** - 添加更详细的错误日志

## 相关文件
- `src/server/services/GeographicPropagationAPI.ts` - 主要修复文件
- `src/server/services/GeographicPropagationService.ts` - 相关服务文件
- `src/server/services/VirusStrainService.ts` - 相关服务文件
- `memory/bug-solutions/030-strain-management-api-failure.md` - 本解决方案记录

## 解决状态
- ✅ 问题诊断完成
- ✅ API方法调用修复
- ✅ 前端API调用验证
- ⏳ 重新部署应用
- ⏳ 功能测试验证

## 测试结果
- 问题根因确认 ✅
- API方法修复完成 ✅
- 前端调用正确 ✅
- 部署待进行 ⏳
- 功能测试待进行 ⏳
