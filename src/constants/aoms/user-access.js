export function isSuperAdmin(user) {
    const currentRole = user?.role || user?.Role;

    return user?.is_founder === true || Number(user?.is_founder) === 1 || Number(currentRole?.is_super) === 1;
}
