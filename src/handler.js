const db = require('./functions/db');
const panel = require('./functions/panel');
const { loadSettings, loadPages } = require('./functions');

const settings = loadSettings();
const pages = loadPages();

module.exports = async (request, reply) => {
    let account = request.session.get('account');
    if (account) {
        account = await db.fetchAccount(account.email);
        if (!account) return request.destroySession(() => reply.redirect('/?err=INVALIDSESSION'));

        const panelData = (await panel.fetchAccount(account.email)).data[0].attributes;
        account = Object.assign(account, {
            root_admin: panelData.root_admin,
            servers: panelData.relationships.servers.data,
            is_new: false
        });
        request.session.set('account', account);
    }

    if (request.url === '/') {
        return reply.view('home.ejs', { data: account, settings });
    } else if (request.url === '/logout') {
        return request.destroySession(() => reply.redirect('/'));
    }

    const path = request.url.slice(1).split('?')[0];
    const page = pages[path];
    if (!page) return reply.view('err404.ejs');

    if (page.type) {
        if (!account) return reply.redirect('/login');
        if (page.type === 2) {
            if (!account.root_admin) return reply.view('err403.ejs', {
                error: 'This is for panel administrators only.'
            });
        }
    }

    if (
        settings.referral.enabled &&
        settings.referral.limit &&
        request.query.aff
    ) await checkReferral(request);

    return reply.view(page.file, {
        settings,
        data: account,
        query: request.query,
        params: request.params
    });
}

async function checkReferral(request) {
    const user = await db.fetchReferralAccount(request.query.aff);
    if (!user) return Promise.resolve();

    user.coins += settings.referral.limit;
    if (user.coins > 999_999) user.coins = 999_999;

    await db.updateAccount(user.email, user);
    return Promise.resolve();
}
