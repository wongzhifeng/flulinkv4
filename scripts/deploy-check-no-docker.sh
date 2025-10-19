#!/bin/bash
# FluLink v4.0 部署检查脚本 (无Docker版本)
# 基于 Zeabur 最佳实践的自动化检查

set -e

echo "🚀 FluLink v4.0 部署检查开始..."
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 已安装${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 未安装${NC}"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 存在${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 不存在${NC}"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 目录存在${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 目录不存在${NC}"
        return 1
    fi
}

# 1. 环境检查
echo -e "\n${BLUE}📋 环境检查${NC}"
echo "================"

check_command "node"
check_command "npm"
check_command "git"

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js 版本: $NODE_VERSION${NC}"

# 检查npm版本
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm 版本: $NPM_VERSION${NC}"

# 2. 项目结构检查
echo -e "\n${BLUE}📁 项目结构检查${NC}"
echo "=================="

check_directory "src"
check_directory "pocketbase"
check_directory "ai-agent"
check_directory "ai-service"

check_file "package.json"
check_file "zeabur.yaml"
check_file "zeabur-optimized.yaml"
check_file "Dockerfile.production"
check_file "pocketbase/Dockerfile.binary"

# 3. 配置文件检查
echo -e "\n${BLUE}⚙️ 配置文件检查${NC}"
echo "=================="

check_file "next.config.js"
check_file "tailwind.config.js"
check_file "tsconfig.json"

# 4. 环境变量检查
echo -e "\n${BLUE}🔐 环境变量检查${NC}"
echo "=================="

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env 文件存在${NC}"
    
    # 检查关键环境变量
    if grep -q "PB_ENCRYPTION_KEY" .env; then
        echo -e "${GREEN}✅ PB_ENCRYPTION_KEY 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️ PB_ENCRYPTION_KEY 未配置${NC}"
    fi
    
    if grep -q "CONTEXT7_API_KEY" .env; then
        echo -e "${GREEN}✅ CONTEXT7_API_KEY 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️ CONTEXT7_API_KEY 未配置${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ .env 文件不存在，请复制 env.zeabur.template${NC}"
fi

# 5. Docker 配置检查
echo -e "\n${BLUE}🐳 Docker 配置检查${NC}"
echo "=================="

if [ -f "Dockerfile.production" ]; then
    echo -e "${GREEN}✅ 生产环境 Dockerfile 存在${NC}"
    
    # 检查关键配置
    if grep -q "FROM node:22-alpine" Dockerfile.production; then
        echo -e "${GREEN}✅ 使用 Node.js 22 Alpine 镜像${NC}"
    else
        echo -e "${YELLOW}⚠️ 建议使用 Node.js 22 Alpine 镜像${NC}"
    fi
    
    if grep -q "npm install --omit=dev" Dockerfile.production; then
        echo -e "${GREEN}✅ 只安装生产依赖${NC}"
    else
        echo -e "${YELLOW}⚠️ 建议只安装生产依赖${NC}"
    fi
fi

if [ -f "pocketbase/Dockerfile.binary" ]; then
    echo -e "${GREEN}✅ PocketBase 二进制 Dockerfile 存在${NC}"
    
    if grep -q "pocketbase_0.22.0_linux_amd64.zip" pocketbase/Dockerfile.binary; then
        echo -e "${GREEN}✅ 使用 PocketBase v0.22.0${NC}"
    else
        echo -e "${YELLOW}⚠️ 建议使用 PocketBase v0.22.0${NC}"
    fi
fi

# 6. Zeabur 配置检查
echo -e "\n${BLUE}☁️ Zeabur 配置检查${NC}"
echo "=================="

if [ -f "zeabur-optimized.yaml" ]; then
    echo -e "${GREEN}✅ 优化版 Zeabur 配置存在${NC}"
    
    # 检查服务配置
    if grep -q "healthcheck:" zeabur-optimized.yaml; then
        echo -e "${GREEN}✅ 健康检查已配置${NC}"
    else
        echo -e "${YELLOW}⚠️ 建议配置健康检查${NC}"
    fi
    
    if grep -q "volumes:" zeabur-optimized.yaml; then
        echo -e "${GREEN}✅ 持久存储已配置${NC}"
    else
        echo -e "${YELLOW}⚠️ 建议配置持久存储${NC}"
    fi
fi

# 7. 代码质量检查
echo -e "\n${BLUE}🔍 代码质量检查${NC}"
echo "=================="

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json 存在${NC}"
    
    # 检查关键依赖
    if grep -q '"next":' package.json; then
        echo -e "${GREEN}✅ Next.js 依赖已配置${NC}"
    else
        echo -e "${RED}❌ Next.js 依赖缺失${NC}"
    fi
    
    if grep -q '"pocketbase":' package.json; then
        echo -e "${GREEN}✅ PocketBase 依赖已配置${NC}"
    else
        echo -e "${RED}❌ PocketBase 依赖缺失${NC}"
    fi
fi

# 8. 构建测试
echo -e "\n${BLUE}🔨 构建测试${NC}"
echo "=============="

if [ -f "package.json" ]; then
    echo "正在测试前端构建..."
    if npm run build &> /dev/null; then
        echo -e "${GREEN}✅ 前端构建成功${NC}"
    else
        echo -e "${RED}❌ 前端构建失败${NC}"
        echo -e "${YELLOW}💡 提示: 运行 'npm run build' 查看详细错误信息${NC}"
    fi
fi

# 9. 依赖检查
echo -e "\n${BLUE}📦 依赖检查${NC}"
echo "=============="

if [ -f "package.json" ]; then
    echo "检查关键依赖..."
    
    # 检查是否安装了依赖
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ node_modules 存在${NC}"
    else
        echo -e "${YELLOW}⚠️ node_modules 不存在，运行 'npm install'${NC}"
    fi
fi

# 10. 总结
echo -e "\n${BLUE}📊 检查总结${NC}"
echo "=============="

echo -e "${GREEN}🎉 FluLink v4.0 部署检查完成！${NC}"
echo ""
echo -e "${YELLOW}📋 下一步操作：${NC}"
echo "1. 确保所有环境变量已正确配置"
echo "2. 在 Zeabur 控制台创建项目"
echo "3. 配置环境变量"
echo "4. 使用 zeabur-optimized.yaml 部署"
echo "5. 验证所有服务健康状态"
echo ""
echo -e "${BLUE}📚 参考文档：${NC}"
echo "- Zeabur 官方文档: https://zeabur.com/docs/zh-CN"
echo "- 部署优化指南: ZEABUR_OPTIMIZATION_GUIDE.md"
echo "- 环境变量模板: env.zeabur.template"
echo ""
echo -e "${GREEN}🚀 准备就绪，开始部署！${NC}"
