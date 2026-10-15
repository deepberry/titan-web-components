export function isSuperAdmin(user) {
    const currentRole = user?.role || user?.Role;

    return user?.is_founder === true || Number(user?.is_founder) === 1 || Number(currentRole?.is_super) === 1;
}

export function isDeveloper(user) {
    return Number(user?.token?.is_dev ?? user?.is_dev) === 1;
}
