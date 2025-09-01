<template>
    <div class="c-header-preference" :class="isPad ? 'is-pad' : ''">
        <div class="c-header-lang" @click="onLangClick">
            <img class="u-icon" src="../../../assets/img/common/language.svg" v-if="isPad" />
            <span class="u-lang" v-else>{{ langText }}</span>
            <el-select
                class="u-lang-select"
                v-model="activeLang"
                filterable
                ref="selectLang"
                :teleported="true"
                @change="onLangChange"
                @visible-change="(val) => onToggle(val, 'showLangSelect')"
            >
                <el-option v-for="item in options.lang" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <div class="c-header-timezone" ref="selectBox">
            <span class="u-timezone u-timezone__wrapper" @click="onTimezoneClick">
                <span class="fi" :class="flag" v-if="hasFlag"> </span>
                <span class="u-utc-str">({{ utcStr }})</span>
            </span>
            <el-select
                class="u-timezone-select u-select"
                v-model="active"
                filterable
                ref="select"
                :teleported="true"
                @change="onTimezoneChange"
                @visible-change="(val) => onToggle(val, 'showSelect')"
            >
                <el-option v-for="item in timezones" :key="item.id" :label="item.timezone" :value="item.timezone">
                    <span class="fi" :class="showFlag(item.region)"></span>
                    {{ item.timezone }} ({{ getTimeZone(item.timezone) }})
                </el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
import User from "../../../utils/user";
import { updatePreference, getTimeZoneList } from "../../../service/account";
import "flag-icons/css/flag-icons.min.css";
import ct from "countries-and-timezones";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
export default {
    name: "Timezone",
    props: {
        isPad: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            timezones: [], //时区列表
            timezone: "",
            locale: "",
            showSelect: false,
            active: "",

            showLangSelect: false,
            activeLang: "",
            options: {
                lang: [
                    {
                        value: "zh-cn",
                        label: "简体中文",
                    },
                    {
                        value: "en-us",
                        label: "English",
                    },
                ],
            },
        };
    },
    computed: {
        flag() {
            const item = this.timezones.find((item) => item.timezone == this.timezone);
            return this.showFlag(item?.region);
        },
        hasFlag() {
            const country = ct.getCountryForTimezone(this.timezone);
            return !!country?.id;
        },
        utcStr() {
            const timezone = ct.getTimezone(this.timezone);
            // 展示不考虑夏令时，实际是展示时区
            return timezone?.utcOffsetStr;
        },
        langText() {
            const item = this.options.lang.find((item) => item.value == this.locale);
            return item?.label;
        },
    },
    mounted() {
        this.loadTimeZone();
        this.timezone = User.getTimezone();
        this.locale = User.getLocale();
        this.active = this.timezone;
        this.activeLang = this.locale;
    },
    methods: {
        async loadTimeZone() {
            const timezones = sessionStorage.getItem("titan_timezones");
            if (timezones) {
                this.timezones = JSON.parse(timezones);
                return;
            }
            const res = await getTimeZoneList({ status: 1 });
            this.timezones = res.data.data || [];
            sessionStorage.setItem("titan_timezones", JSON.stringify(res.data.data || []));
        },
        showFlag(id) {
            return `fi-${id?.toLowerCase()}`;
        },
        getTimeZone(key) {
            const timezone = ct.getTimezone(key);
            // 列表考虑夏令时偏移，实际是展示+多少小时
            return timezone?.dstOffsetStr;
        },
        onTimezoneClick() {
            this.showSelect = true;
            this.$nextTick(() => {
                this.$refs.select.focus();
            });
        },
        onTimezoneChange(timezone) {
            this.save({
                timezone,
                locale: this.locale,
            }).then(() => {
                this.timezone = timezone;
                this.showSelect = false;
                User.setTimezone(timezone);
                // 页面重载
                window.location.reload();
            });
        },
        onLangClick() {
            this.showLangSelect = true;
            this.$nextTick(() => {
                this.$refs.selectLang.focus();
            });
        },
        onLangChange(locale) {
            this.save({
                timezone: this.timezone,
                locale,
            }).then(() => {
                this.locale = locale;
                this.showLangSelect = false;
                User.setLocale(locale);
                // 页面重载
                window.location.reload();
            });
        },
        async save(data) {
            return updatePreference(data).then(() => {
                this.$notify({
                    title: t("commonHeader.messagebox.success_title"),
                    type: "success",
                    duration: 2000,
                });
            });
        },
        onToggle(val, key) {
            if (!val) {
                this[key] = false;
            }
        },
    },
};
</script>

<style lang="less">
.c-header-preference {
    @h: 30px;
    .flex;
    .pr;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .fz(14px);
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    align-items: center;
    .h(@h);
    box-sizing: border-box;
    &.is-pad {
        border: 0;
        .ml(5px);
        .c-header-lang {
            padding: 0;
            box-shadow: none;
            background-color: transparent;
        }
        .u-icon {
            fill: #666 !important;
        }
    }

    .c-header-timezone {
        position: relative;
        max-width: 200px;
        height: 28px;
        cursor: pointer;
        color: #909399;
        .pr;

        .u-timezone__wrapper {
            .dbi;
            padding: 0 15px;
            height: 28px;
            line-height: 28px;
            box-sizing: border-box;
        }
    }
    .c-header-lang {
        .pointer;
        border-right: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        box-shadow: 1px 0 0 0 var(--el-input-border-color) inset, 0 1px 0 0 var(--el-input-border-color) inset,
            0 -1px 0 0 var(--el-input-border-color) inset;
        background-color: var(--el-fill-color-light);
        color: var(--el-color-info);
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 100%;
        border-radius: var(--el-input-border-radius);
        padding: 3.5px 15px;
        white-space: nowrap;
        box-sizing: border-box;
        .pr;
    }
    // .u-select {
    //     width: 200px;
    // }
    .u-icon {
        .size(16px);
    }
    .u-lang-select,
    .u-timezone-select {
        .pa;
        .lt(0);
        height: 28px;
        z-index: 1001;
        .el-input,
        .el-select__wrapper {
            // visibility: hidden;
            opacity: 0;
        }
        .el-select__suffix {
            .none;
        }
        .el-select__placeholder {
            .none;
        }
        .el-select__wrapper {
            background-color: transparent;
            box-shadow: none;
            cursor: pointer;
        }
    }
    .el-input__inner {
        height: 26px;
    }
    .u-utc-str {
        margin-left: 4px;
    }
}

@media screen and (max-width: @ipad-y) {
    .c-header-preference {
        .c-header-timezone {
            .none;
        }
        .c-header-lang {
            padding: 10px !important;
            box-sizing: border-box;
            width: 40px;
            height: 40px;
        }
    }
}
</style>
