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

    // removed Virus

    type TemplateMessage = TemplateMessageItem[];
}

export = Content;
