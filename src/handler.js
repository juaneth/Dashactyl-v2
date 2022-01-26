const db = require('./functions/db');
const { loadSettings, loadPages } = require('./functions');

const settings = loadSettings();
const pages = loadPages();

module.exports = async (request, reply) => {
    let account = request.session.get('account');

    if (
        settings.referral.enabled &&
        settings.referral.limit &&
        request.query.aff
    ) await checkReferral(request);

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

    const updated = await db.fetchAccount(account.email)
    if (updated === null) {
        if (page.type != 0) request.destroySession(() => reply.redirect('/'));
    }
    account = updated;

    console.log(settings)

    return reply.view(page.file, {
        data: account,
        settings: settings,
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
