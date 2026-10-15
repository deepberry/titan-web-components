export function isSuperUser(user) {
    const currentRole = user?.role || user?.Role;

    return Number(user?.token?.is_super ?? user?.is_super) === 1 || Number(currentRole?.is_super) === 1;
}

export function isSuperAdmin(user) {
    return Number(user?.is_founder) === 1 || isSuperUser(user);
}

export function isDeveloper(user) {
    return Number(user?.token?.is_dev ?? user?.is_dev) === 1;
}
