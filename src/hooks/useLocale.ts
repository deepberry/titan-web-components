// 导入全部语言包
import * as Locales from "../locale";

// 工具方法
import { getCurrentInstance, computed, unref } from "vue";
import { get } from "lodash";

// 设定默认语言
const defaultLocale = "zh-cn";

// 读取路径
export const translate = (path, locale) => {
    const _locale = locale.includes("-") ? locale.replace("-", "_") : locale;
    return get(Locales[_locale], `${path}`, path);
};

// 组件hook
export const useLocale = (_locale?: string) => {
    // 获取上下文实例
    const vm = getCurrentInstance() as any;

    // 获取全局语言设置
    const globalLocale = vm?.$i18n?.locale;

    // 获取当前语言:本地设置>全局设置>默认设置
    const locale = computed(() => {
        return _locale || globalLocale || defaultLocale;
    });
    const lang = computed(() => {
        return Locales[unref(locale)];
    });
    return {
        locale,
        lang,
        t: (path: string) => {
            return translate(path, unref(locale));
        },
    };
};
