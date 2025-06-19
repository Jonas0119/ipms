/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export default {
    mounted() {
        window.addEventListener('afterprint', this.back);
    },
    beforeDestroy() {
        window.removeEventListener('afterprint', this.back);
    },
    methods: {
        print() {
            window.print();
        },
        back() {
            this.$router.back();
        }
    }
};
