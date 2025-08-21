#!/bin/bash

# 系统级内存监控脚本

echo "=== API Server 内存监控 ==="
echo "时间: $(date)"
echo

# 1. Docker容器状态
echo "1. Docker容器状态:"
docker stats api-server --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo

# 2. 容器内进程状态
echo "2. 容器内Node.js进程:"
docker exec api-server ps aux | grep node | grep -v grep
echo

# 3. 容器内存详细信息
echo "3. 容器内存详细信息:"
docker exec api-server cat /proc/meminfo | head -10
echo

# 4. Node.js进程详细信息
echo "4. Node.js进程详细信息:"
PID=$(docker exec api-server pgrep node)
if [ ! -z "$PID" ]; then
    echo "PID: $PID"
    docker exec api-server cat /proc/$PID/status | grep -E "(VmPeak|VmSize|VmRSS|VmData|VmStk|VmExe|VmLib)"
fi
echo

# 5. 文件描述符使用情况
echo "5. 文件描述符使用情况:"
if [ ! -z "$PID" ]; then
    FD_COUNT=$(docker exec api-server ls /proc/$PID/fd | wc -l)
    echo "打开的文件描述符数量: $FD_COUNT"
    FD_LIMIT=$(docker exec api-server cat /proc/$PID/limits | grep "Max open files" | awk '{print $4}')
    echo "文件描述符限制: $FD_LIMIT"
fi
echo

# 6. 网络连接状态
echo "6. 网络连接状态:"
docker exec api-server netstat -an | grep -E "(6688|3306|6379)" | head -10
echo

# 7. 检查是否有调试端口开启
echo "7. 调试端口状态:"
docker exec api-server netstat -tlnp | grep 9229 || echo "调试端口未开启"
echo

echo "=== 监控完成 ==="
