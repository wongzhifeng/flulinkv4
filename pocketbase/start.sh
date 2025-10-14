#!/bin/sh

# FluLink v4.0 PocketBase 启动脚本
# 确保服务在 Zeabur 环境中稳定启动

set -e

# 检查必要的环境变量
echo "检查环境变量配置..."

if [ -z "$PB_ENCRYPTION_KEY" ]; then
    echo "错误: PB_ENCRYPTION_KEY 环境变量未设置"
    exit 1
fi

if [ -z "$PB_ADMIN_EMAIL" ]; then
    echo "错误: PB_ADMIN_EMAIL 环境变量未设置"
    exit 1
fi

if [ -z "$PB_ADMIN_PASSWORD" ]; then
    echo "错误: PB_ADMIN_PASSWORD 环境变量未设置"
    exit 1
fi

if [ -z "$PUBLIC_URL" ]; then
    echo "错误: PUBLIC_URL 环境变量未设置"
    exit 1
fi

# 创建必要的目录
echo "创建数据目录..."
mkdir -p /pb_data
mkdir -p /pb_data/logs
mkdir -p /pb_data/files

# 检查 PocketBase 二进制文件是否存在
if [ ! -f "/app/pocketbase" ]; then
    echo "错误: PocketBase 二进制文件不存在"
    exit 1
fi

# 设置文件权限
echo "设置文件权限..."
chmod +x /app/pocketbase

# 启动 PocketBase
echo "启动 PocketBase 服务..."
exec /app/pocketbase serve --http 0.0.0.0:8090 --dir /pb_data