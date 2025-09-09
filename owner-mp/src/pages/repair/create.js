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
import * as common from '../common/common';

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        repairType: null,
        repairLocal: null,
        description: '',
        imgList: [],
        // form data end
        uploadImgList: [],
        submiting: false,
        repairTypeActionVisible: false,
        repairTypeName: '',
        repairTypeActions: [
            { name: '水暖', id: 1 },
            { name: '电路', id: 2 },
            { name: '门窗', id: 3 },
            { name: '公共设施', id: 4 }
        ],
        repairLocalActionVisible: false,
        repairLocalName: '',
        repairLocalActions: []
    },
    validator: {
        formFields: ['repairType', 'repairLocal', 'description'],
        formRule: {
            repairLocal: [{ required: true, message: '请选择维修位置' }],
            repairType: [{ required: true, message: '请选择维修类型' }],
            description: [
                { required: true, message: '请输入问题描述' },
                { min: 5, message: '问题描述应大于5个字' },
                { max: 200, message: '问题描述不能超过5个字' }
            ]
        }
    },
    onShow() {
        this.updateRepairLocalActions();
    },
    onGlobalDataUpdate() {
        this.updateRepairLocalActions();
    },
    updateRepairLocalActions() {
        const repairLocalActions = [];
        const { communityInfo } = this.data;

        if (!communityInfo.current) {
            return;
        }

        []
            .concat(communityInfo.current.houses, communityInfo.current.carports, communityInfo.current.warehouses)
            .forEach(item => {
                repairLocalActions.push({
                    id: item.building_id,
                    name: common.building(item)
                });
            });

        repairLocalActions.push({
            id: 0,
            name: '公共区域'
        });

        this.setData({ repairLocalActions });
    },
    showRepairTypeAction() {
        this.setData({ repairTypeActionVisible: true });
    },
    hideRepairTypeAction() {
        this.setData({ repairTypeActionVisible: false });
    },
    showRepairLocalAction() {
        this.setData({ repairLocalActionVisible: true });
    },
    hideRepairLocalAction() {
        this.setData({ repairLocalActionVisible: false });
    },
    onRepairLocalChange(e) {
        this.setData({
            repairLocal: e.detail.id,
            repairLocalName: e.detail.name
        });
    },
    onRepairTypeChange(e) {
        this.setData({
            repairType: e.detail.id,
            repairTypeName: e.detail.name
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
                const fileName = `repair/${hash}${utils.file.ext(f.url)}`;

                const result = await utils.storageService.upload(
                    f.url,
                    fileName,
                    'image/jpeg',
                    'repair'
                );

                const imageUrl = result.url || `${ASSETS_HOST}${result.key}`;
                newUploadImgList.push({ url: imageUrl });
                newImgList.push(imageUrl);
            }

            $toast.clear();
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
                const { repairType, repairLocal, description, imgList, communityInfo } = this.data;

                utils
                    .request({
                        url: '/repair/create',
                        data: {
                            ...data,
                            repair_type: repairType,
                            building_id: repairLocal,
                            description,
                            repair_imgs: imgList,
                            community_id: communityInfo.current.community_id
                        },
                        method: 'post'
                    })
                    .then(
                        res => {
                            this.setData({ submiting: false });
                            $toast.clear();
                            wx.redirectTo({ url: `/pages/repair/detail?id=${res.data.id}` });
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
                            url: '/repair/tpl',
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
