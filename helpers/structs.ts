export interface Account {
    username:       string;
    email:          string; //!
    password:       string | null;
    avatar:         string;
    resources:      Resource;
    package:        string;
    referral:       string | null;
    permissions:    string[];

    /* for later v2.x release:
    suspended: boolean;
    twoFactor: ...
    lastLogin: number;
    */
}

export interface Egg {
    name:               string;
    display:            string;
    minimum:{
        memory:         number;
        disk:           number;
        cpu:            number;
    }
    maximum:{
        memory:         number | null;
        disk:           number | null;
        cpu:            number | null;
    }
    info:{
        egg:            number;
        docker_image:   string;
        startup:        string;
        environment:    { [key: string]: string }
        feature_limits: { [key: string]: number }
    }
    isDefault:          boolean;
    createdAt:          number;
}

export interface Package {
    name:       string;
    display:    string;
    memory:     number;
    disk:       number;
    cpu:        number;
    servers:    number;
    cost:       number;
    isDefault:  boolean;
    createdAt:  number;
}

export interface PartialServer {
    id:             number;
    identifier:     string;
    name:           string;
    description:    string | null;
    suspended:      boolean;
}

export interface Resource {
    memory:     number;
    disk:       number;
    cpu:        number;
    servers:    number;
    coins:      number;
}

export interface Response<T> {
    object:         string;
    data?:          T[];
    attributes?:    T;
}

export interface Session {
    user:       Account;
    servers:    PartialServer[];
    type:       SessionType;
    isAdmin:    boolean;
}

export enum SessionType {
    None,
    Returning,
    NewAccount
}
