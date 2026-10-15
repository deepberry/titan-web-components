const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");
function header(api) {
    const source = fs
        .readFileSync(path.join(__dirname, "../src/components/Common/Header/Index.vue"), "utf8")
        .match(/<script>([\s\S]*?)<\/script>/)[1];
    const { code } = babel.transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [require("@babel/plugin-transform-modules-commonjs")],
    });
    const exports = {};
    vm.runInNewContext(code, {
        exports,
        require: (id) => (id === "pinia" ? { mapState: () => ({}) } : id.includes("service/account") ? api : {}),
        window: { innerWidth: 1200 },
    });
    const component = exports.default;
    const events = [];
    const instance = { ...component.data(), $emit: (...args) => events.push(args) };
    for (const [name, method] of Object.entries(component.methods)) instance[name] = method.bind(instance);
    return { instance, events };
}
test("logout clears header identity and notifies the shared layout before pending profile returns", async () => {
    let resolveProfile;
    const { instance, events } = header({
        getProfile: () =>
            new Promise((resolve) => {
                resolveProfile = resolve;
            }),
    });
    instance.profile = { id: 101, name: "旧用户" };
    instance.organizations = [{ id: 1 }];
    instance.survey = { id: 3 };
    const pending = instance.loadUserInfo();
    instance.clearUserInfo();
    resolveProfile({ data: { data: { id: 101, name: "旧用户" } } });
    await pending;
    assert.equal(instance.profile.id, undefined);
    assert.equal(instance.organizations.length, 0);
    assert.equal(instance.survey.id, undefined);
    assert.equal(events.length, 1);
    assert.equal(events[0][0], "profile-loaded");
    assert.equal(events[0][1].id, undefined);
});
test("a pending survey cannot restore logged-out user state", async () => {
    let resolveSurvey;
    const { instance } = header({
        getSurveys: () =>
            new Promise((resolve) => {
                resolveSurvey = resolve;
            }),
    });
    const pending = instance.loadSurvey();
    instance.clearUserInfo();
    resolveSurvey({ data: { data: { id: 3 } } });
    await pending;
    assert.equal(instance.survey.id, undefined);
});
