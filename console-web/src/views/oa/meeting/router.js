/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'meeting',
    meta: {
        title: '会议管理',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'meeting',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部会议',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '会议预定',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./create')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '行政事务',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./detail')
        },
        {
            path: 'manage',
            meta: {
                title: '会议室管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HYSGL]
            },
            component: () => import('./manage')
        }
    ]
};
