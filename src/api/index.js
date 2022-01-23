const { loadSettings } = require('../functions');

const settings = loadSettings();

module.exports = (api, _, done) => {
    api.addHook('preHandler', (request, reply, done) => {
        const auth = request.headers['authorization'];

        if (!auth) {
            if (request.session.get('account')) return done();
            reply.send({
                status: 'error',
                message: 'missing authorization'
            });
            return done();
        }

        if (!settings.api.keys.includes(auth)) {
            reply.send({
                status: 'error',
                message: 'invalid authorization'
            });
            return done();
        }

        done();
    });

    api.register(
        (ctx, _, done) => require('./users')(ctx, done),
        { prefix: '/users' }
    );

    api.register(
        (ctx, _, done) => require('./coupons')(ctx, done),
        { prefix: '/coupons' }
    );

    done();
}
