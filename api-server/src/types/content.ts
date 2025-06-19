/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

interface ArticleNodeAttr {
    name: string;
    value: string;
}

interface ArticleNode {
    tag?: string;
    attrs: ArticleNodeAttr[];
    children: (ArticleNode | string)[];
}

interface TemplateMessageItem {
    label: string;
    key: string;
    type: string;
    value?: string;
}

declare namespace Content {
    interface QuestionnaireStatistics {
        total: number;
        options: {
            [option_id: number]: number;
        };
    }

    type Article = ArticleNode[];

    interface Virus {
        today: {
            confirm: number;
            suspect: number;
            heal: number;
            dead: number;
            severe: number;
            storeConfirm: number;
            input: number;
        };
        total: {
            confirm: number;
            suspect: number;
            heal: number;
            dead: number;
            severe: number;
            input: number;
        };
        extData: {
            noSymptom: number;
            incrNoSymptom: number;
        };
        lastUpdateTime: string;
    }

    type TemplateMessage = TemplateMessageItem[];
}

export = Content;
