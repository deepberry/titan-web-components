const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");
function load(source, requireMock) {
    const { code } = babel.transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [require("@babel/plugin-transform-modules-commonjs")],
    });
    const exports = {};
    vm.runInNewContext(code, { exports, require: requireMock });
    return exports;
}
const componentSource = fs
    .readFileSync(path.join(__dirname, "../src/components/Common/Sidebar/Brand.vue"), "utf8")
    .match(/<script>([\s\S]*?)<\/script>/)[1];
const component = load(componentSource, (url) => url).default;
function brand(props) {
    const instance = { logo: "", logoFull: "", name: "测试企业", opened: false, failed: [], ...props };
    for (const [key, getter] of Object.entries(component.computed))
        Object.defineProperty(instance, key, { get: () => getter.call(instance) });
    instance.fail = () => component.methods.onError.call(instance);
    return instance;
}
test("all four upload combinations resolve correctly in both sidebar states", () => {
    for (const opened of [false, true]) {
        assert.match(brand({ opened }).source, opened ? /logo-full.svg$/ : /logo.svg$/);
        assert.equal(brand({ opened, logo: "mark.png" }).source, "mark.png");
        assert.equal(brand({ opened, logoFull: "full.png" }).source, opened ? "full.png" : "");
        assert.equal(
            brand({ opened, logo: "mark.png", logoFull: "full.png" }).source,
            opened ? "full.png" : "mark.png"
        );
    }
    assert.equal(brand({ logoFull: "full.png" }).initial, "测");
});
test("failed custom images fall back without cropping or replacing the brand with DeepBerry", () => {
    const view = brand({ opened: true, logo: "mark.png", logoFull: "full.png" });
    view.fail();
    assert.equal(view.source, "mark.png");
    view.fail();
    assert.equal(view.source, "");
    assert.equal(view.initial, "测");
    assert.equal(view.custom, true);
});
function storeFixture() {
    const requests = [];
    const storeSource = fs.readFileSync(path.join(__dirname, "../src/store/brand.js"), "utf8");
    const { useBrandStore } = load(storeSource, (id) =>
        id === "pinia"
            ? {
                  defineStore: (_, options) => () => {
                      const store = options.state();
                      for (const [key, action] of Object.entries(options.actions)) store[key] = action.bind(store);
                      return store;
                  },
              }
            : { $titan: () => ({ get: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) }) }
    );
    return { store: useBrandStore(), requests };
}
test("organization changes clear old branding and ignore late responses", async () => {
    const { store, requests } = storeFixture();
    const first = store.load(1);
    store.setBrand(1, { logo: "old.png" });
    const second = store.load(2);
    assert.equal(store.logo, "");
    requests[1].resolve({ data: { data: { logo: "new.png" } } });
    await second;
    requests[0].resolve({ data: { data: { logo: "old.png" } } });
    await first;
    assert.equal(store.logo, "new.png");
    assert.equal(store.organizationId, 2);
});
test("saving wins over an outstanding read, and missing configuration restores defaults", async () => {
    const { store, requests } = storeFixture();
    const pending = store.load(1);
    store.setBrand(1, { logo: "saved.png", logo_full: "saved-full.png" });
    requests[0].resolve({ data: { data: { logo: "stale.png" } } });
    await pending;
    assert.equal(store.logo, "saved.png");
    store.setBrand(1, { logo: "", logo_full: "" });
    assert.equal(store.logo, "");
    assert.equal(store.logo_full, "");
    const failed = store.load(2);
    requests[1].reject(new Error("unavailable"));
    await failed;
    assert.equal(store.logo, "");
});
