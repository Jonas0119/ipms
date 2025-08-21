#!/bin/bash

# 停止旧容器
docker stop api-server 2>/dev/null && docker rm api-server 2>/dev/null

# 启动带调试的容器
docker run -d --name api-server \
  --memory=1g \
  -p 6688:6688 \
  -p 9229:9229 \
  -v /Users/pzq/tech/projects/ejyy/api-server/dist:/www/apiserver \
  -w /www/apiserver \
  node:24.2.0 \
  sh -c "npm install && node --inspect=0.0.0.0:9229 --max-old-space-size=1024 ejyy_server.js"

echo "容器已启动，调试端口: 9229"
echo "Chrome DevTools URL: chrome://inspect"
echo "或访问: http://localhost:9229/json/list"