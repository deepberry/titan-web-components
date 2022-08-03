// 导入全部语言包
import * as Locales from "../locale";

// 工具方法
import { getCurrentInstance, computed, unref, provide, inject } from "vue";
import { get } from "lodash";

// 定义全局注入key
export const LocaleInjectionKey = Symbol("__titanLang__");

// 设定默认语言
const defaultLocale = "zhCn";

// 读取路径
export const translate = (path, key, locale) => {
    return get(Locales[locale], `${path}.${key}`, key);
};

// 组件hook
export const useLocale = (_locale?: string) => {
    // 获取上下文实例
    const vm = getCurrentInstance() as any;

    // 获取全局语言设置
    const globalLocale = vm.provides[LocaleInjectionKey] && inject(LocaleInjectionKey);

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
        t: (key) => {
            return translate(vm?.type.name as string, key, unref(locale));
        },
    };
};

// 全局预设
export const useProvideLocale = (props) => {
    // 设置全局语言
    const locale = props.locale;
    if (locale) {
        provide(LocaleInjectionKey, locale);
    }
};
