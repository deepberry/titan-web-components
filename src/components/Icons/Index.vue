<template>
    <i class="i-icon">
        <component :is="name" :fill="color" />
    </i>
</template>

<script>
import logo from "./Logo.vue";
import insights from "./Insights.vue";
import erp from "./Erp.vue";
import user from "./User.vue";
import logout from "./Logout.vue";
import organization from "./Organization.vue";
export default {
    name: "Icon",
    props: ["name", "color"],
    components: {
        logo,
        insights,
        erp,
        user,
        logout,
        organization,
    },
};
</script>
