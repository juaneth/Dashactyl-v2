const { createHash } = require('crypto');
const fetch = require('node-fetch');
const db = require('../functions/db');
const panel = require('../functions/panel');
const { loadSettings } = require('../functions');

module.exports = async (request, reply) => {
    const data = request.body;
    const url = request.url.split('?')[0];

    if (url === '/auth/login') {
        const account = await db.fetchAccount(data.email);
        if (!account) return reply.redirect('/login?err=NOACCOUNT');

        const hashed = createHash('sha256')
            .update(data.password)
            .digest()
            .toString();

        if (hashed !== account.password) return reply.redirect('/login?err=INVALIDPASS');

        const panelData = (await panel.fetchAccount(data.email)).data[0].attributes;
        request.session.set('account', Object.assign(account, {
            password: hashed,
            root_admin: panelData.root_admin,
            servers: panelData.relationships.servers.data,
            is_new: false
        }));

        return reply.redirect('/dashboard');

    } else if (url === '/auth/signup') {
        let account = await db.fetchAccount(data.email);
        if (account) return reply.redirect('/login?err=ACCEXISTS');

        try {
            account = await db.createAccount({
                ...data,
                // temp avatar
                avatar: 'https://cdn.discordapp.com/embed/avatars/1.png'
            });
        } catch (err) {
            return reply.view('err505.ejs', {
                error: err.message,
                settings: loadSettings()
            });
        }

        if (!account) return reply.view('err500.ejs', {
            error: 'Could not create account',
            settings: loadSettings()
        });

        request.session.set('account', account);
        return reply.redirect('/dashboard');

    } else if (url === '/auth/discord') {
        const { discord } = loadSettings();
        return reply.redirect(
            `https://discord.com/api/oauth2/authorize?client_id=${discord.id}`+
            `&redirect_uri=${encodeURIComponent(discord.callback)}`+
            '&response_type=code&scope=identify%20email%20guilds%20guilds.join'+
            ((discord.prompt && discord.prompt === 'none') ? '&prompt=none' : '')
        );

    } else if (url === '/auth/callback') {
        if (request.query.error && request.query.description) {
            if (request.query.error === 'access_denied') return reply.redirect('/login?err=ACCESSDENIED');
        }

        const settings = loadSettings();
        const { discord } = settings;
        let res = await fetch(
            'https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers:{ 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `client_id=${discord.id}&client_secret=${discord.secret}`+
                    `&grant_type=authorization_code&code=${encodeURIComponent(request.query.code)}`+
                    `&redirect_uri=${encodeURIComponent(discord.callback)}`
            }
        );
        
        if (!res.ok) return reply.redirect('/login?err=INVALIDCODE');

        const tokenData = await res.json();
        if (!['identify', 'email', 'guilds', 'guilds.join']
            .every(s => tokenData.scope.includes(s))) return reply.redirect('/login?err=INVALIDSCOPE');

        res = await fetch(
            'https://discord.com/api/users/@me', {
                method: 'GET',
                headers:{ 'Authorization': `Bearer ${tokenData.access_token}` }
            }
        );
        if (!res.ok) return reply.redirect('/login?err=NOACCOUNT');

        const userData = await res.json();
        if (!userData.verified) return reply.redirect('/login?err=NOTVERIFIED');

        if (discord.guild_id?.length && discord.token?.length) {
            await fetch(
                `https://discord.com/api/guilds/${discord.guild_id}/members/${userData.id}`, {
                    method: 'PUT',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bot ${discord.token}`
                    },
                    body: JSON.stringify({
                        access_token: tokenData.access_token
                    })
                }
            );
        }

        let account = await db.fetchAccount(userData.email);
        if (account) {
            let panelData = await panel.fetchAccount(userData.email);
            if (!panelData) {
                let password = Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);

                password = createHash('sha256')
                    .update(password)
                    .digest()
                    .toString();

                await panel.createAccount({
                    username: `${userDAta.username}#${userData.discriminator}`,
                    email: userData.email,
                    first_name: userData.username,
                    last_name: `#${userData.discriminator}`,
                    language: 'en',
                    password
                });
                panelData = await panel.fetchAccount(userData.email);
            }

            panelData = panelData.data[0].attributes;
            request.session.set('account', Object.assign(account, {
                root_admin: panelData.root_admin,
                servers: panelData.relationships.servers.data,
                is_new: false
            }));

        } else {
            account = await db.createAccount({
                username: userData.username + userData.discriminator,
                email: userData.email,
                avatar: `https://cdn.discordapp.com/avatars/${userData.avatar}.png`
            });
            if (!account) return reply.view('err500.ejs', {
                error: 'Could not create account.',
                settings
            });
            request.session.set('account', account);
        }

        return reply.redirect('/dashboard');

    } else {
        return reply.view('err404.ejs', { error: 'Unknown authentication type.' });
    }
}
