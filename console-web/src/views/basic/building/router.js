/**
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2025 IPMS
 * +----------------------------------------------------------------------
 * | IPMS
 * +----------------------------------------------------------------------
 * | Author: support@ipms.local
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'building',
    meta: {
        title: '房产档案',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'community',
        roles: [ROLES.FCDA]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部房产',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.FCDA]
            },
            component: () => import('./list')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '房产详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.FCDA]
            },
            component: () => import('./detail')
        },
        {
            path: 'import',
            meta: {
                title: '房产导入',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: []
            },
            component: () => import('./import')
        }
    ]
};
