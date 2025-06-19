/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'notice',
    meta: {
        title: '小区通知',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'notication',
        roles: [ROLES.XQTZ]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部通知',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XQTZ]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '发布通知',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XQTZ]
            },
            component: () => import('./create')
        },
        {
            path: 'preview/:id',
            meta: {
                title: '通知预览',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.XQTZ]
            },
            component: () => import('./preview')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改通知',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.XQTZ]
            },
            component: () => import('./update')
        }
    ]
};
