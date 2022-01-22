module.exports = async (api, options, done) => {
    // const path = request.url.split('/')[2];
    // if (
    //     !['users', 'coupons', 'resources', 'j4r'].includes(path)
    // ) return reply.send({
    //     status: 'error',
    //     message: 'endpoint not found'
    // });
    await require(`./users`)(api, options, done);
}
