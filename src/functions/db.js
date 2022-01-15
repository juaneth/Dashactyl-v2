const { MongoClient } = require('mongodb');
const functions = require('./loadSettings');

const settings = functions.loadSettings();
const client = new MongoClient(settings.database.connection_uri);
const db = client.db(settings.database.name);

(async () => {
    await client.connect();
    console.log('Connected to the database.');

    const COLLECTIONS = [
        'users', 'sessions', 'coupons',
        'renewals', 'packages', 'eggs',
        'blacklist'
    ];

    for (const coll of COLLECTIONS) {
        db.listCollections({ name: coll }).next((_, data) => {
            if (!data) {
                db.createCollection(coll, async (err, doc) => {
                    if (err) console.log(
                            `There was an error creating the '${coll}' collection in the database. ` +
                            "Please make sure that the connection URI is correct and that the user " +
                            "has the correct permissions to create collections."
                        );
                    if (coll === 'packages') {
                        await doc.insertOne({
                            name: 'Default Package',
                            memory: '1024',
                            disk: '1024',
                            cpu: '100',
                            servers: '1',
                            default: true,
                            date_added: Date.now()
                        });
                    } else if (coll === `eggs`) {
                        await doc.insertOne({
                            name: 'Default Egg',
                            display: 'Default Egg',
                            minimum:{
                                memory: 100,
                                disk: 100,
                                cpu: 10
                            },
                            maximum:{
                                memory: null,
                                disk: null,
                                cpu: null
                            },
                            info:{
                                egg: 3,
                                docker_image: "quay.io/pterodactyl/core:java",
                                startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
                                environment:{
                                    SERVER_JARFILE: "server.jar",
                                    BUILD_NUMBER: "latest",
                                },
                                feature_limits:{
                                    databases: 1,
                                    backups: 1,
                                },
                            },
                            default: true,
                            date_added: Date.now()
                        });
                    }
                    !err && !console.log(`Created the '${coll}' collection.`);
                });
            }
        });
    }
})();


async function getAllAccounts() {
    return await db.collection("users").find({}).toArray();
}

async function fetchAccount(email) {
    return await db.collection('users').findOne({ email });
}

async function createAccount(data) {
    const password =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    let panelData;
    let res = await fetch(
        `${settings.pterodactyl.domain}/api/application/users?filter[email]=${data.email}`, {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${settings.pterodactyl.key}`
            }
        }
    );

    if (res.ok) {
        panelData = (await res.json()).data[0];
    }

    if (!panelData) {
        res = await fetch(
            `${settings.pterodactyl.domain}/api/application/users`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${settings.pterodactyl.key}`
                },
                body: JSON.stringify({ ...data, password })
            }
        );
        if (res.ok) {
            panelData = (await res.json()).attributes;
        } else {
            return null;
        }
    }

    const userData = {
        ...data,
        password,
        coins: 0,
        package: 'default',
        resources:{
            ram: '0',
            disk: '0',
            cpu: '0',
            servers: '0'
        },
        created_at: Date.now()
    }

    await db.collection('users').insertOne(userData);
    return userData;
}

async function deleteAccount(email) {
    return await db.collection('users').deleteOne({ email });
}

async function checkBlacklisted(email) {
    const data = await db.collection('blacklisted').findOne({ email });
    return !!data;
}

async function getPackages(name = null) {
    const packages = await db.collection('packages').find({}).toArray();
    if (!name) return packages;
    if (name === 'default') return packages.find((p) => p.default);
    return packages.find((p) => p.name === name);
}

async function addPackage(name, memory, disk, cpu, servers, isDefault) {
    const packages = await getPackages();
    if (packages.find(p => p.name === name)) return false;

    if (isDefault) {
        const old = packages.find(p => p.default);
        if (old) await db.collection('packages').updateOne(
            { name: old.name },
            { $set:{ default: false }}
        );
    }

    await db.collection('packages').insertOne({
        name,
        memory,
        disk,
        cpu,
        servers,
        default: isDefault,
        date_added: Date.now()
    });

    return true;
}

async function deletePackage(name) {
    await db.collection("packages").deleteOne({ name });
}

module.exports = {
    getAllAccounts,
    fetchAccount,
    createAccount,
    deleteAccount,
    checkBlacklisted,
    getPackages,
    addPackage,
    deletePackage
}
