const fastify = require('fastify');
const session = require('@fastify/session');
const MongoStore = require('connect-mongo');
const { loadSettings } = require('./functions/loadSettings');
const { join } = require('path');

const settings = loadSettings();
const app = fastify({ logger: false });

require('./functions/db');

app.register(require('fastify-cookie'), {
    secret: settings.website.secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
});

app.register(session, {
    secret: settings.website.secret,
    resave: true,
    saveUninitialized: true,
    cookie:{
        secure: settings.website.secure,
    },
    store: new MongoStore({
        mongoUrl: settings.database.connection_uri
    })
});

app.register(require('point-of-view'), {
    engine:{
        ejs: require('ejs')
    },
    root: join(__dirname, `frontend/themes/${settings.website.theme}/pages`)
});

app.register(require('fastify-formbody'));

app.route({
    url: '/auth',
    method: 'POST',
    handler: require('./auth/login')
});
app.poist('/a')
app.all('/', require('./handler'));
app.addHook('onError', console.error);

app.listen(settings.website.port, (err, address) => {
    if (err) throw err;
    console.log(`listening on ${address}`);
});
