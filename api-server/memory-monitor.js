/**
 * 内存监控脚本 - 添加到 ipms_server.js 中使用
 */

// 内存使用监控
function logMemoryUsage() {
    const used = process.memoryUsage();
    const formatMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    console.log('\n=== 内存使用情况 ===');
    console.log(`RSS: ${formatMB(used.rss)} MB`);
    console.log(`Heap Used: ${formatMB(used.heapUsed)} MB`);
    console.log(`Heap Total: ${formatMB(used.heapTotal)} MB`);
    console.log(`External: ${formatMB(used.external)} MB`);
    console.log(`Array Buffers: ${formatMB(used.arrayBuffers)} MB`);
    console.log('==================\n');
}

// 每30秒记录一次内存使用
setInterval(logMemoryUsage, 30000);

// 监听内存警告
process.on('warning', (warning) => {
    if (warning.name === 'MaxListenersExceededWarning') {
        console.error('警告: 事件监听器超过限制!', warning);
    }
    console.error('Node.js警告:', warning);
});

// 内存泄漏检测
let initialMemory = process.memoryUsage().heapUsed;
let memoryGrowthCount = 0;

setInterval(() => {
    const currentMemory = process.memoryUsage().heapUsed;
    const growth = currentMemory - initialMemory;
    const growthMB = Math.round(growth / 1024 / 1024 * 100) / 100;
    
    if (growth > 50 * 1024 * 1024) { // 增长超过50MB
        memoryGrowthCount++;
        console.warn(`内存增长警告: +${growthMB} MB (第${memoryGrowthCount}次)`);
        
        if (memoryGrowthCount > 5) {
            console.error('检测到严重内存泄漏! 考虑重启服务');
            // 可以选择自动重启或发送告警
        }
    }
}, 60000); // 每分钟检查一次

// GC 监控 (需要 --expose-gc 参数)
if (global.gc) {
    setInterval(() => {
        const beforeGC = process.memoryUsage().heapUsed;
        global.gc();
        const afterGC = process.memoryUsage().heapUsed;
        const freed = beforeGC - afterGC;
        if (freed > 10 * 1024 * 1024) { // 释放超过10MB
            console.log(`GC释放内存: ${Math.round(freed / 1024 / 1024 * 100) / 100} MB`);
        }
    }, 120000); // 每2分钟执行一次GC
}

module.exports = {
    logMemoryUsage,
    getMemoryStats: () => process.memoryUsage()
};
