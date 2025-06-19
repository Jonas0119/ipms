/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'inform',
    meta: {
        title: '行政通知',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'inform',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部文章',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./main')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '文章详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./detail')
        },
        {
            path: 'create',
            meta: {
                title: '发布文章',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XZTZ]
            },
            component: () => import('./create')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改文章',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.XZTZ]
            },
            component: () => import('./update')
        },
        {
            path: 'manage',
            meta: {
                title: '文章管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.XZTZ]
            },
            component: () => import('./manage')
        }
    ]
};
