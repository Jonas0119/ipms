/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import VirusScheduleJob from './virus';
import SessionScheduleJob from './session';

// 定时任务最小粒度是小时
export function run() {
    VirusScheduleJob();
    SessionScheduleJob();
}
