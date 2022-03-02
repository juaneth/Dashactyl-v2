import { Db, MongoClient } from 'mongodb';
import load from '../helpers/settings';
import log from '../logger';
import preload from './preload';

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

export default {}
