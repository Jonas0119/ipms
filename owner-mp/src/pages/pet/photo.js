/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    onLoad() {
        this.cropper = this.selectComponent('#cw-image-cropper');

        this.cropper.upload();
    },
    cropperload() {},
    loadimage(e) {
        this.cropper.imgReset();
    },
    async clickcut(e) {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '保存中…'
        });

        try {
            const hash = await utils.file.md5(e.detail.url);
            const fileName = `pet/${hash}${utils.file.ext(e.detail.url)}`;

            const result = await utils.storageService.upload(
                e.detail.url,
                fileName,
                'image/jpeg',
                'pet'
            );

            const pages = getCurrentPages();
            //获取所需页面
            const prePage = pages[pages.length - 2];
            prePage.setData({
                photo: result.url || result.key
            });

            $toast.clear();
            wx.navigateBack({ delta: 1 });
        } catch (error) {
            $toast.clear();
            $notify({
                type: 'danger',
                message: '保存头像失败: ' + error.message
            });
        }
    }
});
