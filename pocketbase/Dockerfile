# FluLink v4.0 PocketBase Dockerfile
# 基于官方 PocketBase 镜像构建

FROM alpine:latest

# 安装必要的依赖
RUN apk add --no-cache \
    ca-certificates \
    curl \
    sqlite \
    && rm -rf /var/cache/apk/*

# 创建应用目录
WORKDIR /app

# 下载 PocketBase 二进制文件
# 使用最新稳定版本
RUN curl -L -o pocketbase.tar.gz https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.tar.gz \
    && tar -xzf pocketbase.tar.gz \
    && rm pocketbase.tar.gz \
    && chmod +x /app/pocketbase

# 创建数据目录
RUN mkdir -p /pb_data \
    && mkdir -p /pb_data/logs \
    && mkdir -p /pb_data/files

# 复制配置文件和钩子
COPY pb.config /app/
COPY hooks/ /app/pocketbase/hooks/
COPY schema.json /app/
COPY start.sh /app/

# 设置启动脚本权限
RUN chmod +x /app/start.sh

# 设置环境变量
ENV PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY}
ENV PB_ADMIN_EMAIL=${PB_ADMIN_EMAIL}
ENV PB_ADMIN_PASSWORD=${PB_ADMIN_PASSWORD}
ENV PB_HOOKS_DIR=/app/pocketbase/hooks
ENV PB_PUBLIC_URL=${PUBLIC_URL}
ENV PB_DB_FILE=/pb_data/pb_data.db
ENV PB_LOG_LEVEL=info
ENV PB_LOG_FILE=/pb_data/logs/pb.log
ENV PB_FILES_PATH=/pb_data/files
ENV PB_FILES_MAX_SIZE=5242880

# 暴露端口
EXPOSE 8090

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8090/api/health || exit 1

# 启动命令
CMD ["/app/start.sh"]