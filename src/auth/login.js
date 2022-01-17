const db = require('../functions/db');
const panel = require('../functions/panel');

module.exports = async (request, reply) => {
    const data = request.body;

    if (request.url === '/auth/login') {
        const account = await db.fetchAccount(data.email);
        if (!account) return reply.redirect('/login?err=NOACCOUNT');
        if (data.password !== account.password) return reply.redirect('/login?err=INVALIDPASS');

        const panelData = (await panel.fetchAccount(data.email)).data[0].attributes;
        request.session.set('account', Object.assign(account, {
            root_admin: panelData.root_admin,
            servers: panelData.relationships.servers.data,
            is_new: false
        }));

        return reply.redirect('/dashboard');

    } else if (request.url === '/auth/signup') {
        let account = await db.fetchAccount(data.email);
        if (account) return reply.redirect('/login?err=ACCEXISTS');

        account = await db.createAccount(data);
        if (!account) return reply.view('err500.ejs');

        request.session.set('account', account);
        return reply.redirect('/dashboard');

    } else {
        return reply.view('err404.ejs');
    }
}
