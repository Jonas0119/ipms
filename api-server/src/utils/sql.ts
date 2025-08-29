/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

/**
 * 字典类型定义
 * 用于表示键值对对象，键为字符串，值为泛型T（默认为any）
 */
type Dict<T = any> = { [k: string]: T };

/**
 * 从数据库COUNT查询结果中提取计数值的工具函数
 * 
 * 功能说明：
 * 1. 处理Knex.js数据库查询中count()方法返回的结果
 * 2. count()查询通常返回格式如：[{ 'count(*)': 5 }] 或 [{ 'count(`id`)': 3 }]
 * 3. 该函数从这种格式的数组中提取实际的数字值
 * 
 * 使用场景：
 * - 统计数据库表中的记录数量
 * - 验证某个条件下的记录是否存在
 * - 获取满足特定条件的记录总数
 * 
 * 实现逻辑：
 * 1. result.pop() - 获取数组中的最后一个元素（通常count查询只返回一条记录）
 * 2. Object.values() - 获取对象中所有的值，形成数组
 * 3. [0] - 取第一个值，即count的结果数字
 * 
 * @param result - 数据库count查询返回的结果数组，格式如 [{ 'count(*)': number }]
 * @returns 提取出的计数值（数字类型）
 * 
 * @example
 * // 数据库查询：SELECT COUNT(*) FROM users
 * // 返回结果：[{ 'count(*)': 42 }]
 * const count = countReader(result); // 返回: 42
 */
export function countReader(result: Dict<number>[]): number {
    return Object.values(result.pop())[0];
}
