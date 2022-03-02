import { Account } from './structs';

export const permissions = [
    'account.update',
    'account.delete',
    'account.enable-referral',

    'server.create',
    'server.update',
    'server.delete',

    'coupon.redeem',
    'admin.coupon.create',
    'admin.coupon.delete',

    'package.view',
    'package.purchase',
    'admin.package.create',
    'admin.package.edit',
    'admin.package.delete',

    'admin.egg.view',
    'admin.egg.create',
    'admin.egg.edit',
    'admin.egg.delete',

    'admin.manage'
]

export function isAdmin(user: Account): boolean {
    return user.permissions.some(p => p.startsWith('admin.'));
}

export function hasPermission(user: Account, perm: string): boolean {
    return user.permissions.includes(perm) ||
        user.permissions.includes('admin.manage');
}
