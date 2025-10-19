# FluLink PocketBase Dockerfile
# 基于《德道经》"无为而治"哲学，构建数据存储服务容器

FROM ghcr.io/pocketbase/pocketbase:0.23.0

# 设置工作目录
WORKDIR /app

# 复制PocketBase配置
COPY pb_schema.json /app/pb_schema.json
COPY pb_hooks/ /app/pocketbase/hooks/
COPY pb_migrations/ /app/pocketbase/migrations/

# 设置权限
RUN chmod +x /app/pocketbase

# 暴露端口
EXPOSE 8090

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8090/api/health || exit 1

# 启动命令
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]