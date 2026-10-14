const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const babel = require("@babel/core");
const originalLoader = require.extensions[".js"];
require.extensions[".js"] = (module, filename) => {
    if (!filename.includes(`${path.sep}constants${path.sep}aoms${path.sep}`)) return originalLoader(module, filename);
    const { code } = babel.transformSync(fs.readFileSync(filename, "utf8"), {
        configFile: false,
        babelrc: false,
        plugins: [require("@babel/plugin-transform-modules-commonjs")],
    });
    module._compile(code, filename);
};
const {
    resolveSidebarMenus,
    resolveActiveMenuPath,
    resolveOpenedMenuPaths,
} = require("../src/constants/aoms/permission");
const { fallbackMenus } = require("../src/constants/aoms/fallback-menus");
const menus = resolveSidebarMenus(fallbackMenus, { is_founder: true });
function flatten(items) {
    return items.flatMap((item) => [item, ...flatten(item.children || [])]);
}

test("AOMS navigation contains the current twelve groups in order", () => {
    assert.deepEqual(
        menus.map((item) => item.path),
        [
            "/",
            "/production",
            "/environment",
            "/tasks",
            "/harvest",
            "/materials",
            "/uc/park",
            "/uc/staff",
            "/uc/employment",
            "/resources",
            "/system",
            "/insights/conf",
        ]
    );
    assert(!flatten(menus).some((item) => item.path.startsWith("/erp") || item.path.startsWith("/components")));
});
test("detail routes highlight the longest menu path without selecting home", () => {
    assert.equal(resolveActiveMenuPath(menus, "/production/cycles/123/edit"), "/production/cycles");
    assert.equal(resolveActiveMenuPath(menus, "/materials/overview"), "/materials/overview");
    assert.equal(resolveActiveMenuPath(menus, "/unknown"), "/unknown");
    assert.equal(resolveActiveMenuPath(menus, "/some-detail", "/tasks/work-standards"), "/tasks/work-standards");
});
test("a menu with a cross-group URL expands its actual ancestor", () => {
    const tree = [{ path: "/park", menuIndex: "park", children: [{ path: "/materials/overview" }] }];
    assert.deepEqual(resolveOpenedMenuPaths(tree, "/materials/overview"), ["park"]);
});
test("permission filtering excludes admin groups and unauthorized children", () => {
    const limited = resolveSidebarMenus([{ code: "production_cycle:view" }], { id: "100" });
    const paths = flatten(limited).map((item) => item.path);
    assert(paths.includes("/production/cycles"));
    assert(!paths.includes("/production/crops"));
    assert(!paths.includes("/system"));
});
test("all visible menu icons exist locally", () => {
    for (const item of flatten(menus)) {
        assert(
            ["aoms", "menus"].some((folder) =>
                fs.existsSync(path.join(__dirname, `../src/assets/img/${folder}`, `${item.icon}.svg`))
            ),
            item.icon
        );
    }
});

test("custom menus form one extensions group and retain links, icons and new-tab settings", () => {
    const custom = [
        {
            id: 2,
            user_id: 1,
            organization_id: 9,
            zh_name: "外部报表",
            en_name: "Reports",
            link: "https://example.com",
            icon: "uploads/report.svg",
            is_blank: 1,
            sort: 2,
        },
        { id: 1, user_id: 1, organization_id: 9, zh_name: "自定义入口", link: "/custom", sort: 1 },
    ];
    const tree = resolveSidebarMenus([...fallbackMenus, ...custom], { is_founder: true });
    const group = tree.find((item) => item.menuIndex === "custom-extensions");
    assert.equal(group.icon, "ext-feat");
    assert.deepEqual(
        group.children.map((item) => item.path),
        ["/custom", "https://example.com"]
    );
    assert.equal(group.children[1].icon, "uploads/report.svg");
    assert.equal(group.children[1].is_blank, 1);
    assert.equal(group.children[1].en_name, "Reports");
    assert.equal(
        tree.indexOf(group) + 1,
        tree.findIndex((item) => item.path === "/system")
    );
    assert.deepEqual(resolveOpenedMenuPaths(tree, "/custom"), ["custom-extensions"]);
    assert.equal(resolveActiveMenuPath(tree, "/custom/detail"), "/custom");
    assert(
        !resolveSidebarMenus(fallbackMenus, { is_founder: true }).some((item) => item.menuIndex === "custom-extensions")
    );
});

test("development always provides a demo custom menu while production hides an empty group", () => {
    const tree = resolveSidebarMenus([], {}, { development: true });
    const group = tree.find((item) => item.menuIndex === "custom-extensions");
    assert.equal(group.children.length, 1);
    assert.equal(group.children[0].title, "自定义项");
    assert.equal(group.children[0].path, "https://deepberry.cn");
    assert.equal(group.children[0].is_blank, 1);
    assert.equal(group.children[0].icon, "ext-func-1");
    assert(!resolveSidebarMenus([], {}, { development: false }).some((item) => item.menuIndex === "custom-extensions"));
    const custom = { id: 1, user_id: 1, organization_id: 1, link: "/custom" };
    const realGroup = resolveSidebarMenus([custom], {}, { development: false }).find(
        (item) => item.menuIndex === "custom-extensions"
    );
    assert.equal(realGroup.children[0].icon, "ext-func-1");
    assert.equal(
        resolveSidebarMenus([custom], {}, { development: true }).find((item) => item.menuIndex === "custom-extensions")
            .children.length,
        2
    );
});

test("custom menus do not grant built-in permissions or override built-in menu metadata", () => {
    const tree = resolveSidebarMenus(
        [
            {
                id: 1,
                user_id: 1,
                organization_id: 9,
                zh_name: "自定义",
                link: "/other",
                code: "nav_insights",
                path: "/insights/conf",
            },
            { user_id: 1, zh_name: "非组织自定义", link: "/ignored" },
        ],
        { id: 1 }
    );
    assert(!tree.some((item) => item.path === "/insights/conf"));
    assert.equal(tree.find((item) => item.menuIndex === "custom-extensions").children.length, 1);
});

test("every visible menu leaf resolves to its AOMS path in the preview router", () => {
    const ts = require("typescript");
    const vm = require("node:vm");
    const { createRouter, createMemoryHistory } = require("vue-router");
    const source = fs.readFileSync(path.join(__dirname, "../src/router/index.ts"), "utf8");
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    });
    const exports = {};
    vm.runInNewContext(outputText, {
        exports,
        require(id) {
            if (id === "vue-router") return { createRouter, createWebHistory: createMemoryHistory };
            if (id.endsWith("routes.json")) return require("../src/constants/aoms/routes.json");
            if (id.endsWith("AomsSidebar")) return { aomsPreviewMenus: menus };
            if (id.endsWith(".vue")) return { name: "Preview" };
            throw new Error(`Unexpected dependency: ${id}`);
        },
    });
    for (const item of flatten(menus).filter((item) => !item.children.length)) {
        const match = exports.default.resolve(item.path);
        assert(match.name, item.path);
        assert.equal(match.path, item.path);
    }
    assert.equal(exports.default.resolve("/production/cycles/123/edit").meta.activeMenu, "/production/cycles");
});

test("developer configuration is last and requires super admin or nav_insights", () => {
    assert.equal(menus.at(-1).path, "/insights/conf");
    for (const user of [{ is_founder: true }, { role: { is_super: 1 } }]) {
        assert(resolveSidebarMenus([], user).some((item) => item.path === "/insights/conf"));
    }
    for (const permissions of [["nav_insights"], [{ code: "nav_insights" }]]) {
        assert(resolveSidebarMenus(permissions, { id: "100" }).some((item) => item.path === "/insights/conf"));
    }
    assert(resolveSidebarMenus([], { permissions: ["nav_insights"] }).some((item) => item.path === "/insights/conf"));
    for (const user of [{ id: "100" }, { id: "100", organization: { user_id: "100" } }]) {
        assert(!resolveSidebarMenus([], user).some((item) => item.path === "/insights/conf"));
    }
});

test("resources is third from last with the first three AOMS entries", () => {
    assert.deepEqual(
        menus.slice(-3).map((item) => item.path),
        ["/resources", "/system", "/insights/conf"]
    );
    const resources = menus.find((item) => item.path === "/resources");
    assert.equal(resources.icon, "resource");
    assert.deepEqual(
        resources.children.map((item) => [item.path, item.icon, item.disabled]),
        [
            ["/resources/agent", "resource-ai", true],
            ["/resources/files/assets", "resource-file", false],
            ["/resources/documents", "resource-document", false],
        ]
    );
    for (const [permission, expectedPath] of [
        ["resource:file", "/resources/files/assets"],
        ["resource:document", "/resources/documents"],
    ]) {
        const authorized = resolveSidebarMenus([{ code: permission }], { id: "100" });
        const resourcePaths = authorized.find((item) => item.path === "/resources").children.map((item) => item.path);
        assert(resourcePaths.includes(expectedPath));
        assert(
            !resourcePaths.includes(
                expectedPath === "/resources/documents" ? "/resources/files/assets" : "/resources/documents"
            )
        );
    }
});

test("UC groups synchronize AOMS navigation and prefix all nested paths", () => {
    const definitions = require("../src/constants/aoms/routes.json").find((item) => item.path === "/").children;
    for (const name of ["Park", "Staff", "Employment"]) {
        const route = definitions.find((item) => item.name === name);
        assert(route.path.startsWith("/uc/"));
        for (const child of route.children) {
            if (child.path.startsWith("/")) assert(child.path.startsWith("/uc/"), child.path);
            if (child.meta?.activeMenu) assert(child.meta.activeMenu.startsWith("/uc/"));
            if (typeof child.redirect === "string") assert(child.redirect.startsWith("/uc/"));
        }
    }
    const payroll = menus.find((item) => item.path === "/uc/employment");
    assert.equal(payroll.title, "薪资管理");
    assert.deepEqual(
        payroll.children.map((item) => item.path),
        ["/uc/employment/payroll-settlements"]
    );
    assert.equal(resolveActiveMenuPath(menus, "/uc/staff/teams/123"), "/uc/staff/teams");
    assert.deepEqual(resolveOpenedMenuPaths(menus, "/uc/staff/teams"), ["/uc/staff"]);
});

test("watermark camera group and its children stay hidden even with permission", () => {
    for (const user of [{ is_founder: true }, { id: "100" }]) {
        const visible = resolveSidebarMenus([{ code: "watermark:admin" }], user);
        assert(!flatten(visible).some((item) => item.path.startsWith("/watermark")));
    }
});

test("tasks and materials are disabled top-level placeholders", () => {
    for (const user of [{ is_founder: true }, { id: "100" }]) {
        const visible = resolveSidebarMenus([], user);
        for (const path of ["/tasks", "/materials"]) {
            const item = visible.find((entry) => entry.path === path);
            assert(item, path);
            assert.equal(item.disabled, true);
            assert.deepEqual(item.children, []);
            assert.deepEqual(item.mockChildren, []);
        }
    }
});

test("environment management follows production with the requested cross-group URLs", () => {
    assert.equal(menus[2].path, "/environment");
    assert.deepEqual(
        menus[2].children.map((item) => [item.title, item.path]),
        [
            ["设备管理", "/greenhouse"],
            ["监控大盘", "/monitor"],
            ["配肥助手", "/lab/fertilization/form"],
        ]
    );
    assert.deepEqual(resolveOpenedMenuPaths(menus, "/monitor"), ["environment"]);
});

test("harvest follows tasks with ERP enabled and Easy Weigh disabled", () => {
    const index = menus.findIndex((item) => item.path === "/tasks");
    const harvest = menus[index + 1];
    assert.equal(harvest.path, "/harvest");
    assert.deepEqual(
        harvest.mockChildren.map((item) => [item.title, item.path, item.disabled]),
        [
            ["深莓轻采收", "/erp", false],
            ["好易称", "", true],
        ]
    );
    assert.deepEqual(resolveOpenedMenuPaths(menus, "/erp"), ["harvest"]);
});

test("production group is disabled while retaining its children", () => {
    const production = menus.find((item) => item.path === "/production");
    assert.equal(production.disabled, true);
    assert(production.children.length > 0);
});
