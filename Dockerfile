# Dockerfile
# FluLink项目Docker配置 - 基于《德道经》"无为而治"哲学

FROM oven/bun:1-alpine

# 设置标签
LABEL "language"="bun"
LABEL "framework"="solidjs"
LABEL "version"="1.0.0"

# 设置工作目录
WORKDIR /src

# 复制package.json和bun.lockb（如果存在）先安装依赖
COPY package.json bun.lockb* ./

# 安装依赖（利用Docker缓存层）
RUN bun install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080

# 暴露端口（Zeabur会自动分配，通常为8080）
EXPOSE 8080

# 启动应用
CMD ["bun", "run", "start"]
