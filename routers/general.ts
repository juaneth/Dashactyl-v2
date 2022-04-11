import { FastifyInstance } from 'fastify';
import { Session } from '../helpers/structs';
import { resolve } from 'path';

export default (api: FastifyInstance, done: (err?: Error | undefined) => void) => {
    api.get('/', (request, reply) => {
        const session = request.session.get<Session>('account');

        // TODO: add valid session check
        reply.view('home.ejs', { ...session });
    });

    api.get('/login', (request, reply) => {
        const session = request.session.get<Session>('account');
        // TODO: valid check here too
        if (session) {
            reply.redirect('/dashboard');
        } else {
            reply.view('login.ejs', {});
        }
    });

    api.register(require("fastify-static"), {
        root: resolve("./theme/public"),
        prefix: '/public/',
    })    

    done();
}
