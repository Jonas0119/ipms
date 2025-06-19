/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

const ROLES = require('@/constants/role');

module.exports = {
    path: 'contract',
    meta: {
        title: '合同管理',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'contract',
        roles: [ROLES.HTGL]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '全部合同',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HTGL]
            },
            component: () => import('./list')
        },
        {
            path: 'create',
            meta: {
                title: '新建合同',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HTGL]
            },
            component: () => import('./create')
        },
        {
            path: 'category',
            meta: {
                title: '合同类别',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.HTGL]
            },
            component: () => import('./category')
        },
        {
            path: 'update/:id',
            meta: {
                title: '修改合同',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.HTGL]
            },
            component: () => import('./update')
        },
        {
            path: 'detail/:id',
            meta: {
                title: '修改详情',
                authRequired: true,
                layout: 'sider',
                nav: false,
                roles: [ROLES.HTGL]
            },
            component: () => import('./detail')
        }
    ]
};
