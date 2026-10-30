// 导入全部语言包
import * as Locales from "../locale";

// 工具方法
import { computed, unref } from "vue";
import { get } from "lodash";
import User from "../utils/user";

// 设定默认语言
const defaultLocale = "zh-cn";

// 读取路径
export const translate = (path, locale) => {
    const _locale = (locale || defaultLocale).toLowerCase().replace(/-/g, "_");
    return get(Locales[_locale], `${path}`, path);
};

// 组件hook
export const useLocale = (_locale?: string) => {
    // Read inside the computed so preference changes invalidate existing translations.
    const locale = computed(() => _locale || User.getLocale() || defaultLocale);
    const lang = computed(() => {
        return Locales[unref(locale).toLowerCase().replace(/-/g, "_")] || Locales.zh_cn;
    });
    return {
        locale,
        lang,
        t: (path: string) => {
            return translate(path, unref(locale));
        },
    };
};
