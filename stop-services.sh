#!/bin/bash

echo "🛑 停止 IPMS 所有服务..."

# 停止并删除容器
docker-compose down

echo "✅ 所有服务已停止！"
echo ""
echo "💡 提示："
echo "   完全清理（包括数据卷）: docker-compose down -v"
echo "   重新启动服务: ./start-services.sh"
