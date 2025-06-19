/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'login',
    meta: {
        authRequired: false,
        title: '授权',
        layout: null,
        nav: false,
        roles: [ROLES.ANYONE]
    },
    component: () => import('./'),
    children: [
        {
            path: '',
            meta: {
                authRequired: false,
                title: '登录',
                layout: null,
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./main')
        },
        {
            path: 'wechat',
            meta: {
                authRequired: false,
                title: '校验',
                layout: null,
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./wechat')
        }
    ]
};
