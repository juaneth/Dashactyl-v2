const db = require('../functions/db');

module.exports = async (api, done) => {
    api.get('/users', async (request, reply) => {
        let entries = await db.getAllAccounts();
        if (request.query.q) {
            entries = entries
                .filter(d => d.username.includes(request.query.q))
                .sort((a, b) => a.panel_id > b.panel_id);
        }

        return reply.view('admin/users.ejs', { entries });
    });

    api.get('/users/:id', async (request, reply) => {
        const user = await db.fetchAccount(request.params.id);
        return reply.view('admin/manage_user.ejs', {
            valid: !!user,
            user
        });
    });

    done();
}
