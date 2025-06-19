/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'elevator',
    meta: {
        title: '智能梯控',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'elevator',
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
                title: '梯控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZNTK]
            },
            component: () => import('./manage')
        }
    ]
};
