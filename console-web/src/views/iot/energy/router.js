/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'energy',
    meta: {
        title: '能耗管理',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'energy',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '人工抄表',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./main')
        },
        {
            path: 'meter',
            meta: {
                title: '仪表管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.NHGL]
            },
            component: () => import('./meter')
        },
        {
            path: 'repeater',
            meta: {
                title: '中继管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.NHGL]
            },
            component: () => import('./repeater')
        }
    ]
};
