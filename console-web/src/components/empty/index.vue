/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

<template>
    <div class="ipms-empty">
        {{ label }}
    </div>
</template>

<script>
export default {
    name: 'Empty',
    props: {
        label: String
    }
};
</script>

<style lang="less">
.ipms-empty {
    text-align: center;
    font-size: 12px;
    color: #999;
    line-height: 40px;
}
</style>
