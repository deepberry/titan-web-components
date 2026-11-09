// Stable navigation identifiers are independent of routes and permission codes.
const slugs = {
    workspace: "home",
    home: "home",
    production: "production",
    cropConfig: "crops",
    plantingPlan: "plans",
    yieldForecast: "forecast",
    productionAccounting: "accounting",
    environmentManagement: "environment",
    environmentDevices: "devices",
    environmentMonitor: "monitor",
    fertilizationAssistant: "fertilizer",
    taskWork: "tasks",
    tasks: "tasks",
    workStandards: "standards",
    taskAssignment: "assignments",
    taskBoard: "board",
    workBoard: "board",
    taskExceptions: "exceptions",
    workExceptions: "exceptions",
    qualityAcceptance: "quality",
    harvestManagement: "harvest",
    deepberryHarvest: "erp",
    easyWeigh: "weighing",
    materials: "materials",
    materialWorkbench: "workbench",
    materialOverview: "overview",
    materialInventory: "inventory",
    inventory: "inventory",
    materialTrace: "trace",
    materialMasterData: "catalog",
    parks: "parks",
    parkProfiles: "profiles",
    spaceConfig: "structure",
    spaceMap: "map",
    teams: "staff",
    workers: "workers",
    jobTypes: "skills",
    teamManagement: "teams",
    ratingConfig: "ratings",
    safetyTraining: "training",
    employment: "payroll",
    payrollSettlements: "settlements",
    resources: "resources",
    agent: "knowledge",
    fileAssets: "files",
    documentList: "documents",
    watermarkAlbums: "albums",
    watermarkTemplates: "watermarks",
    system: "system",
    globalSettings: "settings",
    accountConfig: "accounts",
    roleConfig: "roles",
    webhook: "notifications",
    notice: "announcements",
    auditLogs: "logs",
    developerConfiguration: "developer",
    extensions: "extensions",
};
const pathSlugs = {
    "/uc/park/space-qr": "preview",
    "/uc/park/space-terminal": "terminal",
};

export function parseSidebarForbidden(value) {
    if (typeof value !== "string") return [];
    return [
        ...new Set(
            value
                .split(",")
                .map((key) => {
                    const trimmed = key.trim();
                    return trimmed === "task" ? "tasks" : trimmed;
                })
                .filter(Boolean)
        ),
    ];
}

export function getSidebarSlug(item) {
    const key = item.titleKey?.replace(/^menu\./, "");
    return slugs[key] || pathSlugs[item.path] || item.slug || "";
}

export function applySidebarSettings(items, settings = {}, parentKey = "") {
    const hidden = new Set(Array.isArray(settings?.hidden) ? settings.hidden : []);
    const disabled = new Set(Array.isArray(settings?.disabled) ? settings.disabled : []);

    function visit(nodes, parentKey, parentDisabled) {
        return nodes.flatMap((item) => {
            const slug = getSidebarSlug(item);
            const sidebarKey = slug ? (parentKey ? `${parentKey}.${slug}` : slug) : "";
            if (sidebarKey && hidden.has(sidebarKey)) return [];

            const disabledBySettings = parentDisabled || Boolean(sidebarKey && disabled.has(sidebarKey));
            const children = visit(item.children || [], sidebarKey, disabledBySettings);
            const mockChildren = visit(item.mockChildren || [], sidebarKey, disabledBySettings);
            const hadChildren = (item.children?.length || item.mockChildren?.length) > 0;
            if (hadChildren && !children.length && !mockChildren.length) return [];

            return [
                { ...item, slug, sidebarKey, children, mockChildren, ...(disabledBySettings && { disabled: true }) },
            ];
        });
    }

    return visit(items, parentKey, false);
}
