/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
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
    return new Promise(resolve => {
        wx.getFileSystemManager().readFile({
            filePath,
            success: res => {
                const spark = new SMD5.ArrayBuffer();
                spark.append(res.data);
                const hexHash = spark.end(false);

                resolve(hexHash);
            },
            fail: res => {
                console.log(res);
            }
        });
    });
}
