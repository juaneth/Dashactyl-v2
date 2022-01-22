module.exports = (api, _, done) => {
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
