<template>
    <div class="file-upload">
        <Progress :percent="uploadProgress" status="active" v-if="uploading" />
        <a class="file-upload-download" src="ASSET_HOST + result" v-if="!uploading && result">
            {{ fileName }}
        </a>
        <Upload
            :disabled="uploading"
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :show-upload-list="false"
            :action="ASSET_HOST"
            :data="uploadData"
            :on-error="onUploadError"
            :before-upload="onBeforeUpload"
            :on-success="onUploadSuccess"
            :on-progress="onUploadProgress"
            class="upload"
            ref="upload"
        >
            <Button :loading="uploading">
                <Icon type="ios-cloud-upload-outline" :size="18" />
                <span>{{ !this.result ? text : updateText }}</span>
            </Button>
        </Upload>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Upload, Button, Icon, Progress, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'FileUpload',
    props: {
        width: Number,
        height: Number,
        value: {
            type: Object,
            default: () => {
                return {
                    url: undefined,
                    name: undefined
                };
            }
        },
        dir: {
            type: String,
            required: true
        },
        onUploadStart: {
            type: Function
        },
        onUploadEnd: {
            type: Function
        },
        text: {
            type: String,
            default: '上传附件'
        },
        updateText: {
            type: String,
            default: '修改附件'
        }
    },
    data() {
        return {
            ASSET_HOST,
            uploadData: {},
            uploading: false,
            uploadProgress: 0,
            fileName: '',
            result: this.value
        };
    },
    mixins: [Emitter],
    methods: {
        async onBeforeUpload(file) {
            this.uploading = true;
            this.uploadProgress = 0;
            this.result = null;
            this.fileName = file.name;

            try {
                // 使用统一上传服务
                const response = await utils.upload.upload(file, {
                    dir: this.dir,
                    onProgress: progress => {
                        this.uploadProgress = progress;
                    }
                });

                if (response.code === 200) {
                    const result = {
                        url: response.data.url,
                        name: this.fileName
                    };

                    this.result = response.data.url;
                    this.uploading = false;
                    this.$emit('input', result);
                    this.$emit('on-change', result);
                    this.dispatch('FormItem', 'on-form-change', result);
                    this.$refs.upload.clearFiles();
                } else {
                    throw new Error(response.message || '上传失败');
                }
            } catch (error) {
                const result = {
                    url: undefined,
                    name: undefined
                };
                Message.error('上传失败：' + error.message);
                this.uploading = false;
                this.result = null;
                this.fileName = null;

                this.$emit('input', result);
                this.$emit('on-change', result);
                this.dispatch('FormItem', 'on-form-change', result);
                this.$refs.upload.clearFiles();
            }

            // 阻止默认上传行为
            return false;
        },
        onUploadProgress() {
            // 这个方法现在由统一上传服务的onProgress回调处理
        },
        onUploadSuccess() {
            // 这个方法现在不需要了，因为上传成功在onBeforeUpload中处理
        },
        onUploadError() {
            // 这个方法现在不需要了，因为错误处理在onBeforeUpload中处理
        }
    },
    watch: {
        value(cur) {
            this.result = cur.url;
            this.fileName = cur.name;
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
.file-upload {
    width: 100%;

    &-download {
        margin-bottom: 20px;
    }
}
</style>
