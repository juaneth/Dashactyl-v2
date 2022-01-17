const db = require('../functions/db');

module.exports = async (request, reply) => {
    const data = request.body;

    if (request.url === '/auth/login') {
        const account = await db.fetchAccount(data.email);
        if (!account) return reply.redirect('/login?err=NOACCOUNT');
        if (data.password !== account.password) return reply.redirect('/login?err=INVALIDPASS');
        return reply.redirect(200, '/dashboard');

    } else if (request.url === '/auth/signup') {
        let account = await db.fetchAccount(data.email);
        if (account) return reply.redirect('/login?err=ACCEXISTS');
        account = await db.createAccount(data);
        if (!account) return reply.view('err500.ejs');
        return reply.redirect('/dashboard');

    } else {
        return reply.view('err404.ejs');
    }
}
