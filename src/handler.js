const functions = require('./functions/loadSettings');

const settings = functions.loadSettings();
const pages = functions.loadPages(settings.website.theme);

module.exports = (request, reply) => {
    if (request.url === '/') { 
        return reply.view('home.ejs'); 
    } else if (request.url === '/logout') {
        request.destroySession();
        return reply.redirect('/');
    }

    const path = request.url.slice(1).split('?')[0];
    const page = pages[path];
    if (!page) return reply.view('err404.ejs');
    console.log(page);
    return reply.view(page.file);
}
