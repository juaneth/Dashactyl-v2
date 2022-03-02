import fastify from 'fastify';
import cookie from 'fastify-cookie';
import session from '@fastify/session';
import pointOfView from 'point-of-view';
import { join } from 'path';
import * as ejs from 'ejs';
import routers from './routers';
import load from './helpers/settings';

const app = fastify();
const settings = load();

app.register(pointOfView, {
    engine: { ejs },
    root: join(__dirname, 'theme')
});

app.register(cookie);
app.register(session, {
    secret: settings.secret,
    saveUninitialized: true,
    cookie:{
        secure: true
    }
});

app.register((api, _, done) => routers.general(api, done));
app.register((api, _, done) => routers.auth(api, done));

app.setErrorHandler((err, _, reply) => {
    reply.view('error.ejs', { code: err.code, message: err.message });
});

app.listen(settings.port, (err, _) => {
    if (err) throw err;
    console.log(`listening on http://localhost:${settings.port}`);
});
