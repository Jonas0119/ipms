/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

const app = getApp();
import $toast from '../../components/toast/toast';
import Validator from '../../libs/validator/index';

function IpmsPage(ipmsOptions = {}) {
    const options = Object.assign({}, ipmsOptions, {
        data: {
            ...ipmsOptions.data,
            ...app.data
        },
        // 表单验证
        // validator: {
        //     formFields: [],
        //     formRule: {}
        // },
        // 注意：不要在 data 中放置复杂对象（函数/实例），避免小程序深拷贝警告
        // 用户信息和住宅信息更新时调用
        // onGlobalDataUpdate: () => {},
        onReady() {
            if (ipmsOptions.validator && ipmsOptions.validator.formFields && ipmsOptions.validator.formRule) {
                this.formValidator = new Validator(this.validator.formRule);
            }

            if (typeof ipmsOptions.onReady === 'function') {
                ipmsOptions.onReady.call(this);
            }
        },
        onShow() {
            this.onGlobalDataUpdateCb = this.onGlobalDataUpdate;

            app.on('data', this.onAppUpdateData);

            if (typeof ipmsOptions.onShow === 'function') {
                ipmsOptions.onShow.call(this);
            }
        },
        onHide() {
            app.off('data', this.onAppUpdateData);
            this.onGlobalDataUpdateCb = undefined;

            if (typeof ipmsOptions.onHide === 'function') {
                ipmsOptions.onHide.call(this);
            }
        },
        onLoad(opts) {
            // 将 bridge 赋值到实例属性，避免进入 data 触发深拷贝
            this.bridge = {
                updateData: app.updateData,
                getUserInfo: app.getUserInfo,
                on: app.on,
                off: app.off
            };
            if (typeof ipmsOptions.onLoad === 'function') {
                ipmsOptions.onLoad.call(this, opts);
            }
        },
        onUnload() {
            if (typeof ipmsOptions.onUnload === 'function') {
                ipmsOptions.onUnload.call(this);
            }
        },
        onAppUpdateData(data) {
            this.setData(
                {
                    ...data
                },
                () => {
                    if (typeof this.onGlobalDataUpdateCb === 'function') {
                        this.onGlobalDataUpdateCb();
                    }
                }
            );
        },
        validate(cb) {
            if (!this.formValidator) {
                console.warn('未初始化表单 validator');
            }

            const vdata = {};

            this.validator.formFields.forEach(field => {
                vdata[field] = this.data[field];
            });

            this.formValidator.validate(vdata, (errors, fields) => {
                if (!errors) {
                    cb();
                } else {
                    $toast({ message: errors[0].message });
                }
            });
        }
    });

    Page(options);
}

export { IpmsPage };
