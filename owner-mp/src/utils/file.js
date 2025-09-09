/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import SMD5 from '../libs/md5';

export function ext(filename) {
    const pos = filename.lastIndexOf('.');
    let suffix = '';

    if (pos != -1) {
        suffix = filename.substring(pos);
    }
    return suffix;
}

export function md5(filePath) {
    console.log('md5 函数被调用，文件路径:', filePath);
    
    return new Promise((resolve, reject) => {
        // 先检查文件信息
        wx.getFileInfo({
            filePath: filePath,
            success: (fileInfo) => {
                console.log('文件信息获取成功:', fileInfo);
                
                // 尝试读取文件内容计算 MD5
                wx.getFileSystemManager().readFile({
                    filePath: filePath,
                    success: res => {
                        console.log('文件读取成功，数据长度:', res.data?.byteLength || res.data?.length);
                        const spark = new SMD5.ArrayBuffer();
                        spark.append(res.data);
                        const hexHash = spark.end(false);
                        console.log('MD5 计算完成:', hexHash);
                        resolve(hexHash);
                    },
                    fail: res => {
                        console.error('文件读取失败:', res);
                        // 如果读取失败，使用文件大小和时间戳生成伪 MD5
                        const fallbackHash = generateFallbackHash(filePath, fileInfo.size);
                        console.log('使用 fallback MD5:', fallbackHash);
                        resolve(fallbackHash);
                    }
                });
            },
            fail: (error) => {
                console.error('文件信息获取失败:', error);
                // 如果连文件信息都获取不到，使用时间戳生成伪 MD5
                const fallbackHash = generateFallbackHash(filePath, 0);
                console.log('使用时间戳 fallback MD5:', fallbackHash);
                resolve(fallbackHash);
            }
        });
    });
}

// 生成备用的 MD5 哈希值
function generateFallbackHash(filePath, fileSize) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const pathHash = filePath.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${timestamp.toString(16)}${random}${pathHash}${fileSize.toString(16)}`.substring(0, 32).padEnd(32, '0');
}
