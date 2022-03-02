import { createHash } from 'crypto';
import { Db, MongoClient } from 'mongodb';
import load from '../helpers/settings';
import { Account } from '../helpers/structs';
import defaults from './defaults';
import log from '../logger';
import preload from './preload';
import { defaultUser } from '../helpers/permissions';

let cursor: Db;

export async function init(): Promise<void> {
    const { debug, database } = load();
    const logDebug = (message: string | string[]) => debug ? log.debug(message) : null;

    log.info('Connecting to database...');
    logDebug([
        `uri: ${database.uri}`,
        `cluster: ${database.name}`
    ]);

    try {
        const client = await new MongoClient(database.uri).connect();
        logDebug('initial connection established');
        cursor = client.db(database.name);
        logDebug('database opened');

        await preload(client, database.name);
        logDebug('preload complete');
        log.success('connected to database!');
    } catch (err) {
        log.fatal(String(err));
    }
}

export async function fetchAccounts() {
    return await cursor.collection<Account>('users').find({}).toArray();
}

export async function getAccount(email: string) {
    return await cursor.collection<Account>('users').findOne({ email });
}

export async function createAccount(
    username: string,
    email: string,
    password: string
) {
    const user = await getAccount(email);
    if (user) throw new Error('An account with these credentials already exists.');

    password = createHash('sha256')
        .update(password)
        .digest()
        .toString();

    const data = {
        username,
        email,
        password,
        avatar: '',
        resources: defaults.getDefaultResouces(),
        package: 'default',
        referral: null,
        permissions: defaultUser()
    }

    return await cursor.collection<Account>('users').insertOne(data);
}

export async function updateAccount(email: string, data: Account) {
    let user = await getAccount(email);
    if (!user) throw new Error('No account found with those credentials.');
    user = Object.assign(user, data);
    return await cursor.collection<Account>('users')
        .findOneAndUpdate({ email }, { $set: user });
}

export async function deleteAccount(email: string) {
    const user = await getAccount(email);
    if (!user) throw new Error('No account found with those credentials');
    return await cursor.collection('users')
        .findOneAndDelete({ email });
}

export default {
    accounts:{
        fetch: fetchAccounts,
        get: getAccount,
        create: createAccount,
        update: updateAccount,
        delete: deleteAccount
    }
}
