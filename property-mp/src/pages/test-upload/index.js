/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import utils from '../../utils/index';

IpmsPage({
    data: {
        // 原有上传方式
        originalFileList: [],
        
        // 统一存储上传方式
        unifiedFileList: [],
        
        uploadDir: 'test'
    },

    // 原有上传方式测试
    onOriginalUpload(e) {
        console.log('原有上传方式:', e.detail);
    },

    // 统一存储上传方式测试
    onUnifiedUpload(e) {
        console.log('统一存储上传:', e.detail);
        
        const { file } = e.detail;
        if (file.uploaded) {
            wx.showToast({
                title: '上传成功',
                icon: 'success'
            });
        }
    },

    // 统一存储上传成功
    onUploadSuccess(e) {
        console.log('上传成功事件:', e.detail);
        const { file, result } = e.detail;
        
        // 更新文件列表
        const newList = [...this.data.unifiedFileList, file];
        this.setData({
            unifiedFileList: newList
        });
    },

    // 统一存储上传失败
    onUploadError(e) {
        console.error('上传失败事件:', e.detail);
        
        wx.showToast({
            title: e.detail.error || '上传失败',
            icon: 'error'
        });
    },

    // 直接调用统一存储服务测试
    async testDirectUpload() {
        try {
            // 选择图片
            const res = await new Promise((resolve, reject) => {
                wx.chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera'],
                    success: resolve,
                    fail: reject
                });
            });

            if (res.tempFilePaths && res.tempFilePaths.length > 0) {
                const filePath = res.tempFilePaths[0];
                
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                });

                // 直接调用统一存储服务
                const result = await utils.unifiedStorage.upload(
                    filePath,
                    'direct_test.jpg',
                    'image/jpeg',
                    'direct'
                );

                wx.hideLoading();
                
                console.log('直接上传成功:', result);
                
                wx.showModal({
                    title: '上传成功',
                    content: `URL: ${result.url}\nKey: ${result.key}`,
                    showCancel: false
                });
            }
        } catch (error) {
            wx.hideLoading();
            console.error('直接上传失败:', error);
            
            wx.showModal({
                title: '上传失败',
                content: error.message || '上传失败',
                showCancel: false
            });
        }
    },

    // 清除存储配置缓存
    clearStorageCache() {
        utils.unifiedStorage.clearCache();
        wx.showToast({
            title: '缓存已清除',
            icon: 'success'
        });
    }
});
