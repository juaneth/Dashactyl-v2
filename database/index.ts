import { MongoClient } from 'mongodb';
import preload from './preload';
import load from '../helpers/settings';
import log from '../logger';

let mongo: MongoClient;
let cursor: MongoClient;

export async function init(): Promise<void> {
    const { debug, database } = load();
    const logDebug = (message: string | string[]): void => debug ? log.debug(message) : null;

    log.info('Connecting to database...');
    logDebug([
        `uri: ${database.uri}`,
        `cluster: ${database.name}`
    ]);

    mongo = new MongoClient(database.uri);
    try {
        cursor = await mongo.connect();
        logDebug('initial connection established');

        await preload(cursor, database.name);
        logDebug('preload complete');
        log.success('connected to database!');
    } catch (err) {
        log.fatal(err);
    }
}
