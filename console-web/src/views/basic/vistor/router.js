/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'vistor',
    meta: {
        title: '访客通行',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'vistor',
        roles: [ROLES.FKTX]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部访客',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.FKTX]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '访客详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.FKTX]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '访客登记',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.FKTX]
            },
            component: () => import('./create')
        },
        {
            path: 'scan',
            meta: {
                title: '访客认证',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.FKTX]
            },
            component: () => import('./scan')
        }
    ]
};
