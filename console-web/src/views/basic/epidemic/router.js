/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'epidemic',
    meta: {
        title: '疫情防控',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'xgfy',
        roles: [ROLES.YQFK]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '防控记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.YQFK]
            },
            component: () => import('./list')
        },
        {
            path: 'checkin',
            meta: {
                title: '防控登记',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.YQFK]
            },
            component: () => import('./create')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '防控信息',
                authRequired: true,
                layout: 'sider',
                roles: [ROLES.YQFK]
            },
            component: () => import('./detail')
        }
    ]
};
