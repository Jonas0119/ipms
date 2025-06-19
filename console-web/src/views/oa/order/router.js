/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'order',
    meta: {
        title: '我的工单',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'order',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    redirect: '/oa/order/repair',
    children: [require('./repair/router'), require('./complain/router')]
};
