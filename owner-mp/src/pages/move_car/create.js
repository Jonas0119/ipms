/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import $dialog from '../../components/dialog/dialog';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        actionVisible: false,
        actions: [
            { name: '阻碍通行', id: 1 },
            { name: '占用消防通道', id: 2 },
            { name: '阻挡出入口', id: 3 },
            { name: '影响施工', id: 4 },
            { name: '占用车位', id: 5 }
        ],
        is_new_energy: false,
        //
        move_reason: '',
        car_number: '',
        live_img: '',
        //
        move_reason_text: '',
        uploadImgList: []
    },
    validator: {
        formFields: ['move_reason', 'car_number', 'live_img'],
        formRule: {
            move_reason: [{ required: true, message: '请选择挪车原因' }],
            car_number: [{ required: true, message: '请输入车牌号码' }],
            live_img: [{ required: true, message: '请上传现场照片' }]
        }
    },
    hideAction() {
        this.setData({
            actionVisible: false
        });
    },
    showAction() {
        this.setData({
            actionVisible: true
        });
    },
    onReasonChange(e) {
        this.setData({
            move_reason: e.detail.id,
            move_reason_text: e.detail.name
        });
    },
    updateNewEnergy(e) {
        this.setData({
            is_new_energy: e.detail
        });
        this.selectComponent('#car-number').clear();
    },
    onCarNumberChange(e) {
        this.setData({
            car_number: e.detail
        });
    },
    deleteImg() {
        this.setData({
            live_img: '',
            uploadImgList: []
        });
    },
    async afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST, uploadImgList, imgList } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        try {
            const hash = await utils.file.md5(file.url);
            const fileName = `move_car/${hash}${utils.file.ext(file.url)}`;

            const result = await utils.storageService.upload(
                file.url,
                fileName,
                'image/jpeg',
                'move_car'
            );

            $toast.clear();
            console.log('上传成功，结果:', result);
            this.setData({
                uploadImgList: [
                    {
                        url: result.url || `${ASSETS_HOST}${result.key}`
                    }
                ],
                live_img: result.url || `${ASSETS_HOST}${result.key}`
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
                const { move_reason, car_number, live_img, communityInfo } = this.data;

                utils
                    .request({
                        url: '/move_car/create',
                        method: 'post',
                        data: {
                            ...data,
                            move_reason,
                            car_number,
                            live_img,
                            community_id: communityInfo.current.community_id
                        }
                    })
                    .then(
                        res => {
                            this.setData({
                                submiting: false
                            });

                            $toast.clear();

                            $dialog
                                .alert({
                                    title: '反馈成功',
                                    message: res.data.have_concat_info
                                        ? '我们将立即联系车主挪车，感谢您对物业服务的支持和理解'
                                        : '该车辆非本小区车辆，建议先拨打114或12123联系车主挪车，物业公司也会尽力协助处理'
                                })
                                .then(() => {
                                    wx.redirectTo({ url: `/pages/move_car/detail?id=${res.data.id}` });
                                });
                        },
                        res => {
                            this.setData({
                                submiting: false
                            });
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                            $toast.clear();
                        }
                    );
            };

            wx.getSetting({
                withSubscriptions: true,
                success: res => {
                    utils
                        .request({
                            url: '/move_car/tpl',
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
