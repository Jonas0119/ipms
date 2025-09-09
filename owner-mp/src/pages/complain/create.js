/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        complainType: null,
        complainCateogry: null,
        description: '',
        imgList: [],
        // form data end
        uploadImgList: [],
        submiting: false,
        complainTypeActionVisible: false,
        complainTypeName: '',
        complainTypeActions: [
            { name: '投诉', id: 1 },
            { name: '建议', id: 2 }
        ],
        complainCateogryActionVisible: false,
        complainCateogryName: '',
        complainCateogryActions: [
            { name: '卫生', id: 1 },
            { name: '噪音', id: 2 },
            { name: '服务态度', id: 3 },
            { name: '违建', id: 4 },
            { name: '占用消防通道', id: 5 },
            { name: '小区设施', id: 6 },
            { name: '其他', id: 7 }
        ]
    },
    validator: {
        formFields: ['complainType', 'complainCateogry', 'description'],
        formRule: {
            complainType: [{ required: true, message: '请选择反馈类型' }],
            complainCateogry: [{ required: true, message: '请选择反馈分类' }],
            description: [
                { required: true, message: '请输入问题描述' },
                { min: 5, message: '问题描述应大于5个字' },
                { max: 200, message: '问题描述不能超过5个字' }
            ]
        }
    },
    showComplainTypeAction() {
        this.setData({ complainTypeActionVisible: true });
    },
    hideComplainTypeAction() {
        this.setData({ complainTypeActionVisible: false });
    },
    showComplainCategoryAction() {
        this.setData({ complainCateogryActionVisible: true });
    },
    hideComplainCategoryAction() {
        this.setData({ complainCateogryActionVisible: false });
    },
    onComplainCategoryChange(e) {
        this.setData({
            complainCateogry: e.detail.id,
            complainCateogryName: e.detail.name
        });
    },
    onComplainTypeChange(e) {
        this.setData({
            complainType: e.detail.id,
            complainTypeName: e.detail.name
        });
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList, imgList } = this.data;

        imgList.splice(index, 1);
        uploadImgList.splice(index, 1);

        this.setData({
            imgList,
            uploadImgList
        });
    },
    async afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST, uploadImgList, imgList } = this.data;
        const MAX_IMAGES = 3;

        // 数量限制：最多 3 张
        if (imgList.length >= MAX_IMAGES) {
            return $notify({ type: 'danger', message: `最多可上传${MAX_IMAGES}张图片` });
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        try {
            const files = Array.isArray(file) ? file : [file];
            const remaining = MAX_IMAGES - imgList.length;
            const toUpload = files.slice(0, remaining);
            if (files.length > remaining) {
                $notify({ type: 'warning', message: `最多可上传${MAX_IMAGES}张，已保留前${toUpload.length}张` });
            }

            const newUploadImgList = [...uploadImgList];
            const newImgList = [...imgList];

            for (let i = 0; i < toUpload.length; i++) {
                const f = toUpload[i];
                const hash = await utils.file.md5(f.url);
                const fileName = `complain/${hash}${utils.file.ext(f.url)}`;
                const result = await utils.storageService.upload(
                    f.url,
                    fileName,
                    'image/jpeg',
                    'complain'
                );
                const url = result.url || `${ASSETS_HOST}${result.key}`;
                newUploadImgList.push({ url });
                newImgList.push(url);
            }

            $toast.clear();
            console.log('上传成功');
            this.setData({
                uploadImgList: newUploadImgList,
                imgList: newImgList
            });
        } catch (error) {
            $toast.clear();
            $notify({
                type: 'danger',
                message: '上传图片失败: ' + error.message
            });
        }
    },
    submit() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            const send = data => {
                const { communityInfo, description, complainType, complainCateogry, imgList } = this.data;

                utils
                    .request({
                        url: '/complain/create',
                        data: {
                            ...data,
                            type: complainType,
                            category: complainCateogry,
                            description,
                            complain_imgs: imgList.slice(0, 3),
                            community_id: communityInfo.current.community_id
                        },
                        method: 'post'
                    })
                    .then(
                        res => {
                            this.setData({ submiting: false });
                            $toast.clear();
                            wx.redirectTo({ url: `/pages/complain/detail?id=${res.data.id}` });
                        },
                        res => {
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                            $toast.clear();
                            this.setData({ submiting: false });
                        }
                    );
            };

            wx.getSetting({
                withSubscriptions: true,
                success: res => {
                    utils
                        .request({
                            url: '/complain/tpl',
                            method: 'get'
                        })
                        .then(({ data: tpls }) => {
                            const values = Object.values(tpls);
                            const keys = Object.keys(tpls);
                            const data = {};
                            let gloablSetting = false;

                            // 检查是否有有效的模板ID
                            const validTemplates = values.filter(tpl => tpl && tpl.trim() !== '');
                            
                            if (validTemplates.length === 0) {
                                // 没有有效的模板ID，直接提交申请（不发送订阅消息）
                                keys.forEach(key => {
                                    data[key] = 0;
                                });
                                send(data);
                                return;
                            }

                            // 全局设置啊啊啊
                            if (res.subscriptionsSetting.mainSwitch && res.subscriptionsSetting.itemSettings) {
                                values.forEach((tpl, index) => {
                                    if (tpl && tpl.trim() !== '' && tpl in res.subscriptionsSetting.itemSettings) {
                                        data[keys[index]] =
                                            res.subscriptionsSetting.itemSettings[tpl] === 'accept' ? 1 : 0;
                                        gloablSetting = true;
                                    } else {
                                        data[keys[index]] = 0;
                                    }
                                });
                            }

                            if (gloablSetting) {
                                send(data);
                            } else {
                                // 只使用有效的模板ID
                                wx.requestSubscribeMessage({
                                    tmplIds: validTemplates,
                                    success: res => {
                                        values.forEach((tpl, index) => {
                                            if (tpl && tpl.trim() !== '') {
                                                data[keys[index]] = res[tpl] === 'accept' ? 1 : 0;
                                            } else {
                                                data[keys[index]] = 0;
                                            }
                                        });
                                        send(data);
                                    },
                                    fail: () => {
                                        // 订阅失败也不影响主流程，继续提交申请
                                        keys.forEach(key => {
                                            data[key] = 0;
                                        });
                                        send(data);
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            // 获取模板失败，直接提交申请
                            send({});
                        });
                },
                fail: () => {
                    $toast.clear();
                    $notify({
                        type: 'danger',
                        message: '系统异常，请重试'
                    });
                    this.setData({ submiting: false });
                }
            });
        });
    }
});
