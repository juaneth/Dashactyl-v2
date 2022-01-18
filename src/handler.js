const { loadSettings, loadPages } = require('./functions');

const pages = loadPages();

module.exports = (request, reply) => {
    if (request.url === '/') { 
        return reply.view('home.ejs'); 
    } else if (request.url === '/logout') {
        return request.destroySession(() => reply.redirect('/'));
    }

    const path = request.url.slice(1).split('?')[0];
    const page = pages[path];
    if (!page) return reply.view('err404.ejs', { error: 'Page not found.' });

    const account = request.session.get('account');
    if (page.type) {
        if (!account) return reply.redirect('/login');
        if (page.type === 2) {
            if (!account.root_admin) return reply.view('err403.ejs', {
                error: 'This is for panel administrators only.'
            });
        }
    }

    return reply.view(page.file, { data: account, settings: loadSettings() });
}
