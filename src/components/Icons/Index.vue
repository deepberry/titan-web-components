<template>
    <i class="i-icon">
        <component :is="name" :fill="color" />
    </i>
</template>

<script>
import logo from "./Logo.vue";
import insights from "./Insights.vue";
import account from "./Account.vue";
import erp from "./Erp.vue";
import user from "./User.vue";
import logout from "./Logout.vue";
import organization from "./Organization.vue";
import enterprise from "./Enterprise.vue";
import salary from "./Salary.vue";
import workers from "./Workers.vue";
export default {
    name: "Icon",
    props: ["name", "color"],
    components: {
        logo,
        insights,
        account,
        erp,
        user,
        logout,
        organization,
        enterprise,
        salary,
        workers,
    },
};
</script>
