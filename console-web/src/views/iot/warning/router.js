/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'warning',
    meta: {
        title: '智慧预警',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'warning',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '预警记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'manage',
            meta: {
                title: '中控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHYJ]
            },
            component: () => import('./manage')
        }
    ]
};
