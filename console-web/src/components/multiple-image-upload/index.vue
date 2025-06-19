/** * +---------------------------------------------------------------------- * | 开源物业管理系统，敬请使用 *
+---------------------------------------------------------------------- */

<template>
    <div class="multiple-image-upload">
        <div class="item" v-for="(item, index) in result" :key="index">
            <Progress v-if="item.progress !== 100" :percent="item.progress" hide-info />
            <div v-else>
                <img v-lazy="item.url" />

                <div class="cover">
                    <Icon type="ios-eye-outline" @click.native="preview(index)"></Icon>
                    <Icon type="ios-trash-outline" @click.native="remove(index)"></Icon>
                </div>
            </div>
        </div>

        <Upload
            v-if="result.length !== max"
            class="item"
            accept="image/*"
            :show-upload-list="false"
            ref="upload"
            :before-upload="onBeforeUpload"
            action="data:,"
            multiple
        >
            <div class="upload-trigger">
                <Icon type="ios-camera" size="20"></Icon>
            </div>
        </Upload>

        <div class="preview" v-if="visible">
            <div class="img">
                <img :src="result[previewIndex].url" />
            </div>
            <div class="close" @click="closePreview">
                <Icon type="ios-close-circle-outline" />
            </div>
        </div>
    </div>
</template>

<script>
import { Upload, Button, Icon, Progress, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'MultipleImageUpload',
    props: {
        value: Array,
        max: {
            type: Number,
            default: 4
        },
        dir: {
            type: String,
            required: true
        }
    },
    data() {
        const result = (this.value ? this.value : []).map(key => {
            return {
                name: key,
                url: `${ASSET_HOST}${key}`,
                progress: 100
            };
        });

        return {
            result,
            visible: false,
            previewIndex: -1,
            total: result.length
        };
    },
    mixins: [Emitter],
    methods: {
        async onBeforeUpload(file) {
            if (this.total >= this.max) {
                Message.error(`最多只能上传${this.max}张图片`);
                return false;
            }

            this.total++;

            try {
                const img = await utils.image.parse(file);
                const uuid = img.hash;

                this.result.unshift({
                    name: '',
                    url: '',
                    progress: 0,
                    uuid: uuid
                });

                file.uuid = uuid;

                // 使用统一上传服务
                const response = await utils.upload.upload(file, {
                    dir: this.dir,
                    onProgress: progress => {
                        const index = this.result.findIndex(item => item.uuid === file.uuid);
                        if (index !== -1) {
                            this.result[index].progress = progress;
                        }
                    }
                });

                if (response.code === 200) {
                    const index = this.result.findIndex(item => item.uuid === file.uuid);
                    if (index !== -1) {
                        this.result[index].name = response.data.url;
                        this.result[index].url = response.data.url;
                        this.result[index].progress = 100;
                    }
                    this.onUploadSuccess();
                } else {
                    throw new Error(response.message || '上传失败');
                }
            } catch (error) {
                this.onUploadError(file);
            }

            return false;
        },
        onUploadSuccess() {
            setTimeout(() => {
                this.trigger();
            }, 1000);
        },
        trigger() {
            const val = [];
            this.result.forEach(item => {
                if (item.progress === 100) {
                    val.push(item.name);
                }
            });

            this.$emit('input', val);
            this.$emit('on-change', val);
            this.dispatch('FormItem', 'on-form-change', val);
            if (this.$refs.upload) {
                this.$refs.upload.clearFiles();
            }
        },
        onUploadError(file) {
            Message.error('上传错误！');
            const index = this.result.findIndex(item => item.uuid === file.uuid);
            this.result.splice(index, 1);
            this.total--;
            this.trigger();
        },
        preview(index) {
            this.visible = true;
            this.previewIndex = index;
            window.addEventListener('keydown', this.onKeyDown, false);
        },
        onKeyDown(e) {
            if (e.keyCode === 27) {
                this.closePreview();
            }
        },
        remove(index) {
            this.result.splice(index, 1);
            this.total--;
            this.trigger();
        },
        closePreview() {
            this.visible = false;
            window.removeEventListener('keydown', this.onKeyDown);
        }
    },
    watch: {
        value(cur) {
            this.result = cur.map(key => {
                return {
                    name: key,
                    url: `${ASSET_HOST}${key}`,
                    progress: 100
                };
            });
        }
    },
    components: {
        Upload,
        Button,
        Icon,
        Progress
    }
};
</script>

<style lang="less">
.multiple-image-upload {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;

    .upload-trigger {
        width: 58px;
        height: 58px;
        border-radius: 4px;
        border: 1px dashed #dcdee2;
        text-align: center;
        line-height: 56px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border: 1px dashed #2d8cf0;
            color: #2d8cf0;
        }
    }

    .item {
        margin: 8px 0;
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        &:not(.ivu-upload) {
            width: 58px;
            height: 58px;
            border: 1px solid #dcdee2;
            border-radius: 4px;
        }

        img {
            max-width: 56px;
            max-height: 56px;
        }

        & + .item {
            margin-left: 12px;
        }

        .cover {
            display: none;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            line-height: 58px;
            right: 0;
            background: rgba(0, 0, 0, 0.6);
        }

        &:hover .cover {
            display: block;
        }

        .cover i {
            cursor: pointer;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            margin: 0 2px;
        }
    }

    .preview {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .close {
            font-size: 20px;
            color: #fff;
            position: absolute;
            top: 12px;
            right: 12px;
            cursor: pointer;
        }

        .img {
            width: 95vw;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                max-width: 100%;
                max-height: 100vh;
            }
        }
    }
}

@media screen and (max-width: 576px) {
    .multiple-image-upload {
        .preview {
            .img {
                height: 70vh;
            }
        }
    }
}
</style>
