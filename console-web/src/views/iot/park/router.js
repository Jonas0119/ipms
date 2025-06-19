/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'park',
    meta: {
        title: '智慧停车',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'park',
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
            path: 'blacklist',
            meta: {
                title: '黑名单管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHTC]
            },
            component: () => import('./blacklist')
        },
        {
            path: 'manage',
            meta: {
                title: '停车场管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZHTC]
            },
            component: () => import('./manage')
        }
    ]
};
