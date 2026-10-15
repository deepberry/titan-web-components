<template>
    <CommonLayout
        :preview="useStaticPreview"
        :title="pageTitle"
        subtitle="公共组件与应用外壳"
        :preview-profile="previewProfile"
        :preview-organizations="previewOrganizations"
    >
        <router-view />
    </CommonLayout>
</template>

<script>
import CommonLayout from "@/components/Common/Layout.vue";
import User from "./utils/user";
import { sidebarTitle } from "./constants/AomsSidebar";

export default {
    name: "App",
    components: {
        CommonLayout,
    },
    computed: {
        pageTitle() {
            return sidebarTitle(this.$route.meta) || "控制台";
        },
    },
    data() {
        return {
            useStaticPreview: !User.getToken({ version: 2 }),
            previewProfile: {
                id: 1,
                name: "预览用户",
                avatar: "",
                level: 1,
                organization: {
                    id: 1,
                    user_id: 1,
                    name: "DeepBerry",
                },
                token: {
                    is_dev: 0,
                    is_super: 0,
                },
            },
            previewOrganizations: [
                { organization_id: 1, org_info: { name: "DeepBerry" } },
                { organization_id: 2, org_info: { name: "演示组织" } },
            ],
        };
    },
};
</script>

<style lang="less">
@import "./assets/css/app.less";

body {
    background: var(--titan-page-bg, #f4f6fa);
}

.p-components-home {
    width: min(1180px, 100%);
    margin: 0 auto;
}

.m-components-hero {
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    overflow: hidden;
    box-sizing: border-box;
    padding: 42px 48px;
    border: 1px solid #dce4ef;
    border-radius: 20px;
    background: radial-gradient(circle at 86% 18%, rgba(234, 99, 0, 0.16), transparent 28%),
        linear-gradient(135deg, #ffffff 0%, #f6f9fd 100%);
    box-shadow: 0 18px 48px rgba(7, 31, 73, 0.08);
}

.m-components-hero__content {
    position: relative;
    z-index: 1;
    max-width: 660px;

    h1 {
        margin: 10px 0 14px;
        color: var(--titan-primary-dark, #071f49);
        font-size: clamp(32px, 4vw, 48px);
        line-height: 1.1;
        letter-spacing: -0.03em;
    }

    p {
        margin: 0;
        color: #607089;
        font-size: 16px;
        line-height: 1.8;
    }
}

.m-components-hero__eyebrow,
.m-components-section__heading span {
    color: var(--titan-accent, #ea6300);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.m-components-hero__actions {
    display: flex;
    gap: 10px;
    margin-top: 28px;
}

.m-components-hero__mark {
    width: 150px;
    height: 150px;
    display: grid;
    place-items: center;
    flex: none;
    border: 1px solid rgba(21, 81, 143, 0.12);
    border-radius: 36px;
    background: linear-gradient(145deg, var(--titan-primary, #15518f), var(--titan-primary-dark, #071f49));
    box-shadow: 0 22px 50px rgba(7, 31, 73, 0.22);
    color: #fff;
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -0.08em;
    transform: rotate(4deg);

    span {
        transform: rotate(-4deg);
    }
}

.m-components-section {
    margin-top: 28px;
    padding: 28px;
    border: 1px solid #e1e8f1;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 12px 34px rgba(7, 31, 73, 0.05);
}

.m-components-section__heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;

    h2 {
        margin: 5px 0 0;
        color: #183153;
        font-size: 22px;
    }

    p {
        margin: 0;
        color: #8a98aa;
        font-size: 13px;
    }
}

.m-components-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}

.m-components-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    padding: 18px;
    border: 1px solid #e6ebf2;
    border-radius: 14px;
    background: #fbfcfe;

    h3 {
        margin: 0 0 6px;
        color: #253a57;
        font-size: 15px;
    }

    p {
        margin: 0;
        color: #7c899b;
        font-size: 13px;
        line-height: 1.55;
    }
}

.m-components-card__icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex: none;
    border-radius: 12px;
    background: rgba(21, 81, 143, 0.1);
    color: var(--titan-primary, #15518f);
    font-size: 20px;
}

.m-components-card__status {
    align-self: flex-start;
    margin-left: auto;
    padding: 3px 8px;
    border-radius: 999px;
    background: #edf8f1;
    color: #3a8b57;
    font-size: 11px;
    white-space: nowrap;
}

.m-components-preview {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.m-components-preview__group {
    padding: 20px;
    border: 1px dashed #d6dfeb;
    border-radius: 14px;

    h3 {
        margin: 0 0 16px;
        color: #455974;
        font-size: 14px;
    }
}

.m-components-preview__row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    .el-button + .el-button {
        margin-left: 0;
    }
}

@media screen and (max-width: @ipad-y) {
    .m-components-hero {
        padding: 34px;
    }

    .m-components-hero__mark {
        width: 116px;
        height: 116px;
        border-radius: 28px;
        font-size: 34px;
    }
}

@media screen and (max-width: @phone) {
    .m-components-hero {
        min-height: auto;
        padding: 28px 22px;
    }

    .m-components-hero__mark {
        display: none;
    }

    .m-components-grid,
    .m-components-preview {
        grid-template-columns: 1fr;
    }

    .m-components-section {
        padding: 22px 18px;
    }

    .m-components-section__heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
    }
}
</style>
