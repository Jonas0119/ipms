/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'entrance',
    meta: {
        title: '智能门禁',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'entrance',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '通行记录',
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
                title: '门禁管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZNMJ]
            },
            component: () => import('./manage')
        }
    ]
};
