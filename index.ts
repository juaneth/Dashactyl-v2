import fastify from 'fastify';
import session from '@fastify/session';
import pointOfView from 'point-of-view';
import { join } from 'path';
import * as ejs from 'ejs';
import routers from './routers';

const app = fastify();

app.register(pointOfView, {
    engine: { ejs },
    root: join(__dirname, 'theme')
});

app.register(session, {
    secret: '',
    saveUninitialized: true,
    cookie:{
        secure: true
    }
});

app.register((api, _, done) => routers.general(api, done));

app.listen(3000, (err, addr) => {
    if (err) throw err;
    console.log(`listening on port ${addr}`);
});
