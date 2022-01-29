const db = require('../functions/db');

module.exports = async (api, done) => {
    api.get('/packages', async (request, reply) => {
        let entries = await db.getPackages();
        if (request.query.q) {
            entries = entries
                .filter(d => d.username.includes(request.query.q))
                .sort((a, b) => a.panel_id > b.panel_id);
        }

        return reply.view('admin/packages.ejs', { entries });
    });

    api.get('/packages/:name', async (request, reply) => {
        const user = await db.getPackages(request.params.name);
        return reply.view('admin/manage_package.ejs', {
            valid: !!user,
            user
        });
    });

    done();
}
