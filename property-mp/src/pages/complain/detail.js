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
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';
import ROLES from '../../constants/role';

IpmsPage({
    data: {
        ASSETS_HOST,
        ROLES,
        id: null,
        fetching: true,
        steps: [{ text: '反馈提交' }, { text: '反馈受理' }, { text: '工单确认' }, { text: '反馈回复' }],
        detail: {},
        dispose_reply: '',
        dispose_content: '',
        dispose_imgs: [],
        uploadImgList: [],
        submiting: false,
        loaded: false
    },
    validator: {
        formFields: ['dispose_content'],
        formRule: {
            dispose_content: [
                { required: true, message: '请输入反馈信息' },
                { min: 5, message: '反馈信息应大于5个字' },
                { max: 200, message: '反馈信息不能超过5个字' }
            ]
        }
    },
    onGlobalDataUpdate() {
        this.loadData();
    },
    onLoad(opts) {
        // opts.id = 5;
        this.setData(
            {
                id: opts.id
            },
            () => {
                this.loadData();
            }
        );
    },
    loadData() {
        if (!this.data.id || !this.data.postInfo.default_community_id || this.data.loaded) {
            return Promise.reject();
        }

        this.setData({ loaded: true });

        utils
            .request({
                url: `/complain/my_detail`,
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(res => {
                this.setData({
                    fetching: false,
                    detail: res.data
                });

                wx.stopPullDownRefresh();
            });
    },
    onPullDownRefresh() {
        this.loadData();
    },
    showComplainImg(e) {
        const { index } = e.currentTarget.dataset;

        wx.previewImage({
            current: index,
            urls: this.data.detail.info.complain_imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    },
    showDisposeImg(e) {
        const { index } = e.currentTarget.dataset;

        wx.previewImage({
            current: index,
            urls: this.data.detail.info.dispose_imgs.map(item => `${this.data.ASSETS_HOST}${item}`)
        });
    },
    confirmSubmit() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        this.setData({
            submiting: true
        });

        utils
            .request({
                url: '/complain/confirm',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id,
                    dispose_reply: this.data.dispose_reply
                }
            })
            .then(
                res => {
                    $toast.clear();
                    $notify({
                        type: 'success',
                        message: '确认工单成功'
                    });

                    this.setData({
                        detail: {
                            ...this.data.detail,
                            info: {
                                ...this.data.detail.info,
                                dispose_reply: this.data.dispose_reply,
                                step: 3,
                                disposed_at: res.data.disposed_at
                            }
                        },
                        submiting: false
                    });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                    this.setData({
                        submiting: false
                    });
                }
            );
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList, dispose_imgs } = this.data;

        dispose_imgs.splice(index, 1);
        uploadImgList.splice(index, 1);

        this.setData({
            dispose_imgs,
            uploadImgList
        });
    },
    async afterRead(e) {
        const { file } = e.detail;
        const { uploadImgList, dispose_imgs } = this.data;
        const MAX_IMAGES = 3;

        // 数量限制：最多 3 张
        const currentCount = dispose_imgs.length;
        if (currentCount >= MAX_IMAGES) {
            return $notify({
                type: 'danger',
                message: `最多可上传${MAX_IMAGES}张图片`
            });
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        try {
            console.log('[Complain] 开始文件上传:', file);

            // 统一处理单/多文件
            const files = Array.isArray(file) ? file : [file];
            const remainingSlots = MAX_IMAGES - currentCount;
            const toUpload = files.slice(0, remainingSlots);

            if (files.length > remainingSlots) {
                $notify({
                    type: 'warning',
                    message: `最多可上传${MAX_IMAGES}张，已为你保留前${toUpload.length}张`
                });
            }

            const newUploadImgList = [...uploadImgList];
            const newDisposeImgs = [...dispose_imgs];

            for (let i = 0; i < toUpload.length; i++) {
                const f = toUpload[i];
                // 使用统一存储服务（串行上传，避免并发问题）
                const result = await utils.unifiedStorage.upload(
                    f.url,
                    `complain_${Date.now()}_${i}.jpg`,
                    f.type || 'image/jpeg',
                    'complain'
                );

                newUploadImgList.push({ url: result.url });
                newDisposeImgs.push(result.url);
            }

            console.log('[Complain] 文件上传成功');

            $toast.clear();

            this.setData({
                uploadImgList: newUploadImgList,
                dispose_imgs: newDisposeImgs
            });

        } catch (error) {
            console.error('[Complain] 文件上传失败:', error);

            $toast.clear();
            $notify({
                type: 'danger',
                message: error.message || '上传图片失败，请重试'
            });
        }
    },
    finishSubmit() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            utils
                .request({
                    url: '/complain/finish',
                    method: 'post',
                    data: {
                        id: this.data.id,
                        community_id: this.data.postInfo.default_community_id,
                        dispose_imgs: this.data.dispose_imgs,
                        dispose_content: this.data.dispose_content
                    }
                })
                .then(
                    res => {
                        $toast.clear();
                        $notify({
                            type: 'success',
                            message: '工单确认完成成功'
                        });

                        this.setData({
                            detail: {
                                ...this.data.detail,
                                info: {
                                    ...this.data.detail.info,
                                    dispose_imgs: this.data.dispose_imgs,
                                    dispose_content: this.data.dispose_content,
                                    step: 4,
                                    finished_at: res.data.finished_at
                                }
                            },
                            submiting: false
                        });
                    },
                    res => {
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                        this.setData({
                            submiting: false
                        });
                    }
                );
        });
    }
});
