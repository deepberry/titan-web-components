const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadLocale(locale) {
    const exports = {};
    const source = fs.readFileSync(path.join(__dirname, `../src/locale/lang/${locale}.ts`), "utf8");
    vm.runInNewContext(
        ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS },
        }).outputText,
        { exports }
    );
    return exports.default;
}
function keys(value, prefix = "") {
    return Object.entries(value).flatMap(([key, entry]) =>
        typeof entry === "object" ? keys(entry, `${prefix}${key}.`) : [`${prefix}${key}`]
    );
}

test("public locale dictionaries have matching keys and cover component translation calls", () => {
    const zh = keys(loadLocale("zh-cn"));
    const en = keys(loadLocale("en-us"));
    assert.deepEqual(en.sort(), zh.sort());
    function scan(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const filename = path.join(directory, entry.name);
            if (entry.isDirectory()) scan(filename);
            else if (/\.(vue|js|ts)$/.test(filename)) {
                for (const match of fs.readFileSync(filename, "utf8").matchAll(/(?:\bt|\$t)\(\s*["']([^"']+)["']/g)) {
                    assert(zh.includes(match[1]), `${filename}: ${match[1]}`);
                }
            }
        }
    }
    scan(path.join(__dirname, "../src/components"));
});

test("all built-in menus and route titles have Chinese and English translations", () => {
    const dictionaries = ["zh-cn", "en-us"].map((locale) => require(`../src/constants/aoms/${locale}.json`));
    const context = {};
    vm.runInNewContext(
        fs
            .readFileSync(path.join(__dirname, "../src/constants/aoms/fallback-menus.js"), "utf8")
            .replace("export const fallbackMenus =", "globalThis.menus ="),
        context
    );
    function check(items) {
        for (const item of items) {
            const metadata = item.meta || item;
            if (metadata.title && (item.meta ? metadata.menu : true)) {
                assert(metadata.titleKey, metadata.title);
                for (const dictionary of dictionaries) {
                    assert.equal(
                        typeof metadata.titleKey.split(".").reduce((value, key) => value?.[key], dictionary),
                        "string",
                        metadata.titleKey
                    );
                }
            }
            check(item.children || []);
            check(item.mockChildren || []);
        }
    }
    check(context.menus);
    check(require("../src/constants/aoms/routes.json"));
});
