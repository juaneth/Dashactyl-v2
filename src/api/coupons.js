const db = require('../functions/db');

module.exports = async (api, done) => {
    api.get('/', async (_, reply) => {
        const data = await db.getAllCoupons();
        for (const c of data) delete c._id;
        return reply.send({ status: 'success', data });
    });

    api.get('/:code', async (request, reply) => {
        if (!request.params.code?.length) return reply.send({
            status: 'error',
            message: 'missing parameter code'
        });

        const data = await db.fetchCoupon(request.params.code);
        if (!data) return reply.send({
            status: 'error',
            message: 'coupon not found'
        });

        delete data._id;
        return reply.send({ status: 'success', data });
    });

    api.post('/', async (request, reply) => {
        if (
            !['coins', 'ram', 'disk', 'cpu', 'servers']
            .some(k => k in request.body)
        ) return reply.send({
            status: 'error',
            message: 'missing required properties in body'
        });

        const data = request.body;
        data.code ||= Math.random().toString(36).substring(2, 15);
        data.coins = validate(data.coins, 999_999_999);

        data.ram = validate(data.ram, 999_999).toString();
        data.disk = validate(data.disk, 999_999).toString();
        data.cpu = validate(data.cpu, 999_999).toString();
        data.servers = validate(data.servers, 10);

        data.uses = validate(data.uses, 10_000);
        data.uses ||= null;
        data.expires_at = validate(data.expires_at, 2.628E+09);
        data.expires_at ||= null;

        await db.createCoupon({
            ...data,
            created_at: Date.now()
        });
        const res = await db.fetchCoupon(data.code);
        delete res._id;
        return reply.send({ status: 'success', data: res });
    });

    api.post('/:code/redeem', async (request, reply) => {
        if (!request.params.code?.length) return reply.send({
            status: 'error',
            message: 'missing parameter code'
        });

        if (!request.body.user) return reply.send({
            status: 'error',
            message: 'missing required body property user'
        });

        const data = await db.fetchCoupon(request.params.code);
        if (!data) return reply.send({
            status: 'error',
            message: 'coupon not found'
        });

        const user = await db.fetchAccount(request.body.user);
        if (!user) return reply.send({
            status: 'error',
            message: 'user not found'
        });

        if (data.expires_at > Date.now()) return reply.send({
            status: 'error',
            message: 'coupon is expired'
        });

        if (data.uses === 0) return reply.send({
            status: 'error',
            message: 'coupon has ran out of uses'
        });

        data.uses &&= data.uses - 1;
        if (data.coins) user.coins += data.coins;

        for (let [key, val] of Object.entries(user.resources)) {
            val = Number(val) + Number(data[key]);
            if (val > 999_999) val = 999_999;
            user.resources[key] = String(val);
        }

        await db.updateCoupon(data.code, data);
        await db.updateAccount(user.email, user);
        return reply.send({
            status: 'success',
            data:{ coupon: data, user }
        });
    });

    api.delete('/:code', async (request, reply) => {
        if (!request.params.code?.length) return reply.send({
            status: 'error',
            message: 'missing parameter code'
        });

        const data = await db.fetchCoupon(request.params.code);
        if (!data) return reply.send({
            status: 'error',
            message: 'coupon not found'
        });

        await db.deleteCoupon(data.code);
        delete data;
        return reply.send({ status: 'success', data: null });
    });

    done();
}

function validate(field, limit) {
    if (!field || field < 0) return 0;
    if (field > limit) return limit;
    return field;
}
