/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <section class="card mr notice">
        <h2 class="card-title">小区最新通知</h2>

        <div v-if="detail.title">
            <h4>{{ detail.title }}</h4>
            <div class="text">{{ detail.overview }}</div>
        </div>
        <div class="empty" v-else>
            小区当前未发布任何通知
        </div>
    </section>
</template>

<script>
export default {
    name: 'NoticeChart',
    props: {
        detail: Object
    }
};
</script>

<style lang="less">
.notice {
    flex: auto;

    h4 {
        color: #fff;
        text-align: center;
        font-weight: 400;
        font-size: 1vw;
        line-height: 1.8vw;
    }

    .text {
        font-size: 0.8vw;
        line-height: 1.2vw;
        text-overflow: ellipsis;
        word-break: break-all;
        color: #fff;
        display: -webkit-box;
        -webkit-line-clamp: 6;
        -webkit-box-orient: vertical;
    }

    .empty {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6vw;
        color: #999;
    }
}
</style>
