/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import redis from 'redis';
import config from '~/config';

const client = config.debug ? null : redis.createClient(config.redis);

const ERROR = 'REDIS_ERROR';
const SUCCESS = 'OK';

export type ERROR_TYPE = typeof ERROR;
export type SUCCESS_TYPE = typeof SUCCESS;

const storage = {};

export async function set(key: string, value: string): Promise<ERROR_TYPE | SUCCESS_TYPE> {
    if (config.debug) {
        storage[key] = value;

        return SUCCESS;
    }

    return new Promise(resolve => {
        client.set(key, value, (err, reply) => {
            if (err) {
                resolve(ERROR);
            } else {
                resolve(reply);
            }
        });
    });
}

export async function get(key: string): Promise<ERROR_TYPE | string> {
    if (config.debug) {
        return storage[key];
    }

    return new Promise(resolve => {
        client.get(key, (err, reply) => {
            if (err) {
                resolve(ERROR);
            } else {
                resolve(reply);
            }
        });
    });
}
