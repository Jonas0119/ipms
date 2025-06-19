/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'lamp',
    meta: {
        title: '智慧照明',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'lamp',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '工作记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'line',
            meta: {
                title: '线路管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHZM]
            },
            component: () => import('./line')
        },
        {
            path: 'manage',
            meta: {
                title: '灯控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHZM]
            },
            component: () => import('./manage')
        }
    ]
};
