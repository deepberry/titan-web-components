<template>
    <TitanConfigProvider locale="enUs"><RobotLive :camera="camera" :robot="robot" /></TitanConfigProvider>
</template>

<script>
export default {
    name: "App",
    props: [],
    components: {},
    data: function () {
        return {
            camera: [],
            robot: [],
        };
    },
    computed: {},
    watch: {},
    methods: {},
    created: function () {},
    mounted: function () {},
};
</script>
