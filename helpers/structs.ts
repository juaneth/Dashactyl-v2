export interface Account {
    username: string;
    email: string; //! PK
    password: string | null;
    avatar: string;
    resources: Resource;
    package: string;
    referral: string | null;
    permissions: string[];

    /* for later v2.x release:
    suspended: boolean;
    twoFactor: ...
    lastLogin: number;
    */
}

export interface PartialServer {
    id: number;
    identifier: string;
    name: string;
    description: string | null;
    suspended: boolean;
}

export interface Resource {
    ram: number;
    disk: number;
    cpu: number;
    servers: number;
    coins: number;
}

export interface Session {
    user: Account;
    servers: PartialServer[];
    type: SessionType;
    isAdmin: boolean;
}

export enum SessionType {
    None,
    Returning,
    NewAccount
}
