#!/bin/bash

# 完整的Docker调试启动脚本
# 用法: ./docker-full-debug.sh [--recreate]
# --recreate: 删除旧容器并创建新容器
# 无参数: 仅重启现有容器

RECREATE=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --recreate|-r)
            RECREATE=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --recreate, -r    删除旧容器并创建新容器"
            echo "  --help, -h        显示此帮助信息"
            echo
            echo "示例:"
            echo "  $0                重启现有容器"
            echo "  $0 --recreate     重新创建容器"
            exit 0
            ;;
        *)
            echo "未知参数: $1"
            echo "使用 --help 查看帮助"
            exit 1
            ;;
    esac
done

echo "=== API Server 调试模式启动 ==="

if [ "$RECREATE" = true ]; then
    echo "🔄 重新创建容器模式"
    # 停止并删除旧容器
    echo "停止并删除现有容器..."
    docker stop api-server 2>/dev/null && docker rm api-server 2>/dev/null
    CREATE_NEW=true
else
    echo "🔄 重启现有容器模式"
    # 检查容器是否存在
    if docker ps -a --format '{{.Names}}' | grep -q "^api-server$"; then
        echo "重启现有容器..."
        docker restart api-server
        CREATE_NEW=false
    else
        echo "未找到现有容器，将创建新容器..."
        CREATE_NEW=true
    fi
fi

# 创建新容器（仅在需要时）
if [ "$CREATE_NEW" = true ]; then
    echo "📦 创建新的调试容器..."
    docker run -d --name api-server \
      --memory=1g \
      --memory-swap=2g \
      -p 6688:6688 \
      -p 9229:9229 \
      -v /Users/pzq/tech/projects/ipms/api-server/dist:/www/apiserver \
      -v /Users/pzq/tech/projects/ipms/api-server/memory-monitor.js:/www/apiserver/memory-monitor.js \
      -w /www/apiserver \
      node:24.2.0 \
      sh -c "
        npm install && 
        sleep 20 &&
        if [ -f ipms_server.js ] && [ -s ipms_server.js ]; then
          cp ipms_server.js ipms_server.js.backup &&
          echo 'require(\"./memory-monitor.js\");' >> ipms_server.js &&
          echo 'Memory monitor added successfully'
        else
          echo 'Error: ipms_server.js not found or empty' &&
          exit 1
        fi &&
        node --inspect=0.0.0.0:9229 --expose-gc --max-old-space-size=768 ipms_server.js
      "
    
    if [ $? -eq 0 ]; then
        echo "✅ 新容器创建成功"
    else
        echo "❌ 新容器创建失败"
        exit 1
    fi
else
    echo "✅ 容器重启完成"
fi

# 等待容器启动
if [ "$CREATE_NEW" = true ]; then
    echo "等待新容器启动..."
    sleep 5
else
    echo "等待容器重启完成..."
    sleep 3
fi

# 检查容器状态
if docker ps | grep -q api-server; then
    echo "✅ 容器运行成功!"
    echo
    if [ "$CREATE_NEW" = true ]; then
        echo "🆕 新容器已创建并启动"
        echo "📦 容器信息: $(docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep api-server)"
    else
        echo "🔄 现有容器已重启"
        echo "📦 容器信息: $(docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep api-server)"
    fi
    echo
    echo "🔧 调试信息:"
    echo "- 应用端口: http://localhost:6688"
    echo "- 调试端口: 9229 (ws://localhost:9229)"
    echo "- Chrome DevTools: chrome://inspect"
    echo "- 调试URL: http://localhost:9229/json/list"
    echo
    echo "📊 使用以下命令监控:"
    echo "- 系统监控: ./system-monitor.sh"
    echo "- 堆转储: ./heap-dump.sh"
    echo "- 查看日志: docker logs -f api-server"
    echo
    echo "🔍 Chrome DevTools 使用步骤:"
    echo "1. 打开 Chrome，访问 chrome://inspect"
    echo "2. 确保 'Discover network targets' 已启用"
    echo "3. 添加 localhost:9229 到 'Configure' 中"
    echo "4. 点击 'inspect' 开始调试"
    echo "5. 转到 Memory 标签页进行内存分析"
    echo
    
    # 显示初始状态
    echo "📈 初始状态:"
    if [ -f "./system-monitor.sh" ]; then
        ./system-monitor.sh
    else
        docker stats api-server --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    fi
    
    # 设置定时监控
    echo "🕐 开始定时监控 (每60秒)..."
    echo "使用 Ctrl+C 停止监控"
    echo "运行模式: $([ \"$CREATE_NEW\" = true ] && echo \"新容器\" || echo \"重启容器\")"
    
    while true; do
        sleep 60
        echo "=== $(date) ==="
        docker stats api-server --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
        echo
    done
    
else
    echo "❌ 容器启动失败!"
    echo "检查日志:"
    docker logs api-server
    exit 1
fi
