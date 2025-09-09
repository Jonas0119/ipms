/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { CwComponent } from '../common/component';
import utils from '../../utils/index';

const app = getApp();

CwComponent({
    props: {
        show: Boolean
    },
    data: {
        map: {}
    },
    beforeCreate() {
        utils
            .request({
                url: '/option/colleague',
                method: 'post',
                data: {
                    community_id: app.data.postInfo.default_community_id
                }
            })
            .then(res => {
                const map = {};

                res.data.list.forEach(item => {
                    if (item.department in map) {
                        map[item.department].users.push(item);
                    } else {
                        map[item.department] = {
                            name: item.department,
                            users: [item]
                        };
                    }
                });

                this.setData({ map });
            });
    },
    methods: {
        onClose() {
            this.$emit('close');
        },
        select(e) {
            const { id, name } = e.currentTarget.dataset;

            this.$emit('select', { id, name });
        }
    }
});
