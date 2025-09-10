#!/bin/bash

echo "🚀 启动 IPMS 所有服务..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 停止并删除已存在的容器（如果存在）
echo "🧹 清理已存在的容器..."
docker-compose down

# 构建并启动所有服务
echo "🏗️  启动所有服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 所有服务已启动完成！"
echo ""
echo "📋 服务访问地址："
echo "   🌐 前端控制台: http://localhost:8080"
echo "   🔧 API 服务: http://localhost:6688"
echo "   🗄️  MySQL: localhost:3306"
echo "   🔴 Redis: localhost:6379"
echo "   📦 MinIO: http://localhost:9001"
echo ""
echo "📋 容器 IP 地址："
echo "   🗄️  MySQL (mysql57): 172.18.0.2"
echo "   🔴 Redis (my-redis): 172.18.0.3"
echo "   📦 MinIO (minio): 172.18.0.4"
echo "   🔧 API Server (api-server1): 172.18.0.5"
echo "   🌐 Nginx (my-nginx1): 172.18.0.6"
echo ""
echo "🛠️  常用命令："
echo "   查看日志: docker-compose logs -f [服务名]"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart [服务名]"
echo "   进入容器: docker exec -it [容器名] /bin/bash"
