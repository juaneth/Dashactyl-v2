import { FastifyInstance } from 'fastify';

export default (api: FastifyInstance, err: (err?: Error | undefined) => void) => {
    api.get('/', (request, reply) => {
        const session = request.session.get
    })
}
