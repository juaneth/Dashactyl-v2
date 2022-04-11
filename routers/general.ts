import { FastifyInstance } from 'fastify';
import { Session } from '../structures';

export default (api: FastifyInstance, done: (err?: Error | undefined) => void) => {
    api.get('/', (request, reply) => {
        const session = request.session.get<Session>('account') as Session | undefined;
        if (!session) {
            reply.view('login.ejs', {});
        } else {
            reply.view('home.ejs', { ...session });
        }
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

    api.get('/signup', (request, reply) => {
        const session = request.session.get<Session>('account');
        // TODO: valid check here too
        if (session) {
            reply.redirect('/dashboard');
        } else {
            reply.view('signup.ejs', {});
        }
    });

    done();
}
