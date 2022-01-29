require('./functions/db');

const fastify = require('fastify');
const session = require('@fastify/session');
const MongoStore = require('connect-mongodb-session')(session);
const { loadSettings } = require('./functions');
const { join } = require('path');

const settings = loadSettings();
const app = fastify({
    logger: settings.website.logger
        ? {
            prettyPrint:{
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
        : false
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
app.register(
    (api, options, done) => require('./api')(api, options, done),
    { prefix: '/api' }
);
app.register(
    (api, options, done) => require('./admin')(api, options, done),
    { prefix: '/admin' }
);
app.all('*', require('./handler'));

app.listen(settings.website.port, (err, address) => {
    if (err) throw err;
    console.log(`listening on ${address}`);
});
