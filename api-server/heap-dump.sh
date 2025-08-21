#!/bin/bash

# 内存堆转储和分析脚本

echo "=== Node.js 堆内存分析工具 ==="

# 获取Node.js进程PID
PID=$(docker exec api-server pgrep node)

if [ -z "$PID" ]; then
    echo "错误: 找不到Node.js进程"
    exit 1
fi

echo "找到Node.js进程 PID: $PID"
echo

# 1. 生成堆转储文件
echo "1. 生成堆转储文件..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
HEAP_FILE="heap_dump_${TIMESTAMP}.heapsnapshot"

# 使用Node.js内置方法生成堆转储
docker exec api-server sh -c "kill -USR2 $PID" 2>/dev/null || {
    echo "尝试使用调试端口生成堆转储..."
    curl -X POST "http://localhost:9229/json/runtime/evaluate" \
         -H "Content-Type: application/json" \
         -d '{
           "expression": "require(\"v8\").writeHeapSnapshot(\"/www/apiserver/'$HEAP_FILE'\")"
         }' 2>/dev/null || echo "无法通过调试端口生成堆转储"
}

# 2. 检查文件是否生成
echo "2. 检查堆转储文件..."
if docker exec api-server test -f "/www/apiserver/$HEAP_FILE"; then
    echo "堆转储文件已生成: $HEAP_FILE"
    # 复制到宿主机
    docker cp api-server:/www/apiserver/$HEAP_FILE ./
    echo "文件已复制到当前目录"
else
    echo "堆转储文件生成失败，尝试手动方法..."
fi

echo

# 3. 内存使用分析
echo "3. 当前内存使用分析:"
docker exec api-server cat /proc/$PID/smaps | grep -E "(Size|Rss|Pss)" | head -20

echo

# 4. 分析建议
echo "4. 分析建议:"
echo "- 使用Chrome DevTools打开生成的.heapsnapshot文件"
echo "- 查看Memory标签页，分析内存占用最大的对象"
echo "- 重点关注: Strings, Arrays, Functions, Objects"
echo "- 对比多个时间点的堆转储文件，找出内存增长的对象"
echo

# 5. 生成分析报告
echo "5. 生成分析报告..."
cat > memory_analysis_${TIMESTAMP}.txt << EOF
内存分析报告 - $(date)
===================

容器信息:
$(docker stats api-server --no-stream)

进程信息:
$(docker exec api-server ps aux | grep node | grep -v grep)

内存详情:
$(docker exec api-server cat /proc/$PID/status | grep -E "(VmPeak|VmSize|VmRSS|VmData)")

连接统计:
$(docker exec api-server netstat -an | grep -c ESTABLISHED) 个已建立的连接
$(docker exec api-server netstat -an | grep -c TIME_WAIT) 个TIME_WAIT连接

建议:
1. 检查数据库连接池是否正常释放
2. 检查定时任务是否创建过多连接
3. 检查WebSocket连接是否正常清理
4. 监控Redis连接状态
EOF

echo "分析报告已保存: memory_analysis_${TIMESTAMP}.txt"
echo

echo "=== 分析完成 ==="
