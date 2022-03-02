import * as ejs from 'ejs';
import fastify from 'fastify';
import cookie from 'fastify-cookie';
import session from '@fastify/session';
import { join } from 'path';
import pointOfView from 'point-of-view';
import { init } from './database';
import log from './logger';
import load from './helpers/settings';
import routers from './routers';

const app = fastify();
const settings = load();

app.register(cookie);
app.register(session, {
    secret: settings.secret,
    saveUninitialized: true,
    cookie:{
        secure: true
    }
});

app.register(pointOfView, {
    engine: { ejs },
    root: join(__dirname, 'theme')
});

app.register((api, _, done) => routers.general(api, done));
app.register((api, _, done) => routers.auth(api, done));

app.setErrorHandler((err, _, reply) => {
    reply.view('error.ejs', { code: err.code, message: err.message });
});

(async () => {
    await init();

    app.listen(settings.port, (err, _) => {
        if (err) throw err;
        log.success(`listening on http://localhost:${settings.port}`);
    });
})();
