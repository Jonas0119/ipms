/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export default {
    // 发起人
    id: 1,
    type: 1,
    relation_user_id: null,
    condition_list: null,
    next: {
        id: 2,
        type: 5,
        condition_list: [
            {
                id: 3,
                type: 4,
                name: '部门',
                field: 'deparment_id',
                value: 1,
                next: {
                    id: 6,
                    type: 2,
                    applicant_assign: 0,
                    relation_user_id: 3
                }
            },
            {
                id: 6,
                type: 4,
                name: '部门',
                field: 'deparment_id',
                value: 1
            }
        ],
        next: {
            id: 10,
            type: 3,
            relation_user_id: 4
        }
    }
};
