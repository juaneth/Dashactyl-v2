module.exports = (api, _, done) => {
    api.addHook('preHandler', (request, reply, done) => {
        const account = request.session.get('account');
        if (!account) return reply.redirect('/login');
        if (!account.root_admin) return reply.view('err403.ejs', {
            error: 'This is for panel administrators only.'
        });

        done();
    });

    api.register(
        (ctx, _, done) => require('./users')(ctx, done),
        { prefix: '/users' }
    );

    api.register(
        (ctx, _, done) => require('./packages')(ctx, done),
        { prefix: '/packages' }
    );

    /*

    api.get('/eggs', (request, reply) => require('./eggs')(request, reply));

    api.get('/api', (request, reply) => require('./api')(request, reply));

    api.register(
        (ctx, _, done) => require('./store')(ctx, done),
        { prefix: '/store' }
    );

    api.all('*', (_, reply, done) => {
        if (reply.sent) return;
        reply.view('err404.ejs');
        return done();
    });

    */
    done();
}
