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

test("AOMS navigation contains the current ten groups in order", () => {
    assert.deepEqual(
        menus.map((item) => item.path),
        [
            "/",
            "/production",
            "/tasks",
            "/materials",
            "/employment",
            "/park",
            "/staff",
            "/watermark",
            "/resources",
            "/system",
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
        assert(fs.existsSync(path.join(__dirname, "../src/assets/img/aoms", `${item.icon}.svg`)), item.icon);
    }
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
