/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';

IpmsPage({
    data: {
        car_number: '',
        car_type: 1,
        is_new_energy: 0,
        submiting: false,
        id: null
    },
    validator: {
        formFields: ['car_number'],
        formRule: {
            car_number: [{ required: true, message: '请输入车牌号码' }]
        }
    },
    onLoad(opt) {
        this.setData({
            id: parseInt(opt.id, 10)
        });
    },
    onCarTypeChange(e) {
        this.setData({
            car_type: e.target.dataset.name
        });
    },
    onCarEnergyChange(e) {
        const is_new_energy = e.target.dataset.name;

        this.setData({
            is_new_energy
        });

        this.selectComponent('#car-number').clear();
    },
    onCarNumberChange(e) {
        this.setData({
            car_number: e.detail
        });
    },
    submit() {
        this.validate(() => {
            const { car_number, is_new_energy, car_type, id } = this.data;

            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            this.selectComponent('#car-number').closeKeyboard();

            utils
                .request({
                    url: '/car/binding',
                    method: 'post',
                    data: {
                        building_id: id,
                        is_new_energy,
                        car_number,
                        car_type
                    }
                })
                .then(
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $toast.clear();
                        const pages = getCurrentPages();
                        const prePage = pages[pages.length - 2];
                        prePage.fetchingList();
                        wx.navigateBack({ delta: 1 });
                    },
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $toast.clear();
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                    }
                );
        });
    }
});
