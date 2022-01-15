require('./functions/db');

const fastify = require('fastify');
const session = require('@fastify/session');
const MongoStore = require('connect-mongodb-session')(session);
const { loadSettings } = require('./functions/loadSettings');
const { join } = require('path');

const settings = loadSettings();
const app = fastify({
    logger:{
        prettyPrint:{
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
        }
    }
});

app.register(require('fastify-cookie'), {
    secret: settings.website.secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
});

const store = new MongoStore({
    uri: settings.database.connection_uri,
    collection: 'sessions'
});

app.register(session, {
    secret: settings.website.secret,
    resave: true,
    saveUninitialized: true,
    cookie:{
        secure: settings.website.secure
    },
    store
});

app.register(require('point-of-view'), {
    engine:{
        ejs: require('ejs')
    },
    root: join(__dirname, `frontend/themes/${settings.website.theme}/pages`)
});

app.register(require('fastify-formbody'));

app.all('/auth/*', require('./auth/login'));
app.all('*', require('./handler'));

app.listen(settings.website.port, (err, address) => {
    if (err) throw err;
    console.log(`listening on ${address}`);
});
