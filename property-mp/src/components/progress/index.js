/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
import { BLUE } from '../common/color';
import { getRect } from '../common/utils';
IpmsComponent({
    props: {
        inactive: Boolean,
        percentage: {
            type: Number,
            observer: 'setLeft'
        },
        pivotText: String,
        pivotColor: String,
        trackColor: String,
        showPivot: {
            type: Boolean,
            value: true
        },
        color: {
            type: String,
            value: BLUE
        },
        textColor: {
            type: String,
            value: '#fff'
        },
        strokeWidth: {
            type: null,
            value: 4
        }
    },
    data: {
        right: 0
    },
    mounted() {
        this.setLeft();
    },
    methods: {
        setLeft() {
            Promise.all([getRect(this, '.ipms-progress'), getRect(this, '.ipms-progress__pivot')]).then(
                ([portion, pivot]) => {
                    if (portion && pivot) {
                        this.setData({
                            right: (pivot.width * (this.data.percentage - 100)) / 100
                        });
                    }
                }
            );
        }
    }
});
