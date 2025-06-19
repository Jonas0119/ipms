/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Knex from 'knex';
import config from '~/config';

const model = Knex({
    client: 'mysql',
    connection: config.mysqlConfig,
    pool: {
        min: 0,
        max: 200
    }
});

export default model;
