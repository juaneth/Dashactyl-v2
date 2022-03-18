import { FastifyInstance } from 'fastify';
// import { Session } from '../helpers/structs';

export default (api: FastifyInstance, done: (err?: Error | undefined) => void) => {
    api.post('/auth/login', async (request, reply) => {});

    api.post('/auth/signup', async (request, reply) => {});

    api.get('/auth/discord', async (request, reply) => {});

    done();
}
