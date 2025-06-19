/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: '/iot',
    meta: {
        title: '智慧物联',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'iot',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        require('./dashboard/router'),
        require('./entrance/router'),
        require('./elevator/router'),
        require('./lamp/router'),
        require('./energy/router'),
        require('./park/router'),
        require('./warning/router')
        // require('./monitor/router'),
        // require('./charging/router')
    ]
};
