const db = require('../functions/db');

module.exports = async (api, done) => {
    api.get('/', async (_, reply) => {
        const data = await db.getAllAccounts();
        for (const u of data) delete u._id;
        return reply.send({ status: 'success', data });
    });

    api.get('/:id', async (request, reply) => {
        if (!request.params.id?.length) return reply.send({
            status: 'error',
            message: 'missing parameter id'
        });

        const id = parseInt(request.params.id);
        if (isNaN(id)) return reply.send({
            status: 'error',
            message: 'invalid user id'
        });

        const data = await db.fetchAccount(id);
        if (!data) return reply.send({
            status: 'error',
            message: 'user not found'
        });

        delete data._id;
        return reply.send({ status: 'success', data });
    });

    api.patch('/:id', async (request, reply) => {
        if (!request.params.id?.length) return reply.send({
            status: 'error',
            message: 'missing parameter id'
        });

        const id = parseInt(request.params.id);
        if (isNaN(id)) return reply.send({
            status: 'error',
            message: 'invalid user id'
        });

        if (
            !['username', 'email', 'password', 'avatar'].some(k => k in request.body)
        ) return reply.send({
            status: 'error',
            message: 'missing required properties in body'
        });

        const data = await db.fetchAccount(id);
        if (!data) return reply.send({
            status: 'error',
            message: 'user not found'
        });

        const { body } = request;
        if (body.username) {
            const matches = /[^a-zA-Z0-9!\$\#\*\_\+\-]/g.exec(body.username);
            if (matches?.length) {
                return reply.send({
                    status: 'error',
                    message: `invalid character '${matches[0]}' not allowed for username`
                });
            }
            data.username = body.username;
        }

        if (body.email) {
            if (/.+@.+\.[a-zA-Z]{2,}/gi.test(body.email)) return reply.send({
                status: 'error',
                message: 'invalid email provided'
            });
            data.email = body.email;
        }

        if (body.password) data.password = body.password;

        if (body.avatar) {
            if (!body.avatar.startsWith('https://')) return reply.send({
                status: 'error',
                message: 'invalid avatar provided'
            });
            data.avatar = body.avatar;
        }

        await db.updateAccount(id, body);
        delete data._id;
        return reply.send({ status: 'success', data });
    });

    api.put('/:id/coins', async (request, reply) => {
        if (!request.params.id?.length) return reply.send({
            status: 'error',
            message: 'missing parameter id'
        });

        if (
            request.body.coins === undefined ||
            isNaN(request.body.coins)
        ) return reply.send({
            status: 'error',
            message: 'missing body property coins'
        });

        const id = parseInt(request.params.id);
        if (isNaN(id)) return reply.send({
            status: 'error',
            message: 'invalid user id'
        });

        const data = await db.fetchAccount(id);
        if (!data) return reply.send({
            status: 'error',
            message: 'user not found'
        });

        let { coins } = request.body;
        if (coins < 0) coins = 0;
        if (coins > 999_999_999) coins = 999_999_999;
        data.coins = coins;

        await db.updateAccount(id, data);
        delete data._id;
        return reply.send({ status: 'success', data });
    });

    api.put('/:id/package', async (request, reply) => {
        if (!request.params.id?.length) return reply.send({
            status: 'error',
            message: 'missing parameter id'
        });

        if (typeof request.body.package !== 'string') return reply.send({
            status: 'error',
            message: 'missing body property package'
        });

        const id = parseInt(request.params.id);
        if (isNaN(id)) return reply.send({
            status: 'error',
            message: 'invalid user id'
        });

        const data = await db.fetchAccount(id);
        if (!data) return reply.send({
            status: 'error',
            message: 'user not found'
        });

        let { package } = request.body;
        const exists = await db.getPackages(package);
        if (!exists) return reply.send({
            status: 'error',
            message: 'package not found'
        });

        data.package = package;
        await db.updateAccount(id, data);
        delete data._id;
        return reply.send({ status: 'success', data });
    });

    api.patch('/:id/resources', async (request, reply) => {
        if (!request.params.id?.length) return reply.send({
            status: 'error',
            message: 'missing parameter id'
        });

        if (
            !['ram', 'disk', 'cpu', 'servers'].every(k => k in request.body)
        ) return reply.send({
            status: 'error',
            message: 'missing required properties in body'
        });

        const id = parseInt(request.params.id);
        if (isNaN(id)) return reply.send({
            status: 'error',
            message: 'invalid user id'
        });

        const data = await db.fetchAccount(id);
        if (!data) return reply.send({
            status: 'error',
            message: 'user not found'
        });

        const { body } = request;
        for (let [key, val] of Object.entries(body)) {
            val = parseInt(val);
            if (isNaN(val)) body[key] = 0;
            if (val < 0) body[key] = 0;
            if (val > 999_999) body[key] = 999_999;
        }
        if (body.servers > 10) body.servers = 10;

        for (const [key, val] of Object.entries(body)) body[key] = String(val);
        data.resources = body;

        await db.updateAccount(id, data);
        delete data._id;
        return reply.send({ status: 'success', data: data.resources });
    });

    done();
}
