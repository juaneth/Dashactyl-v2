const fetch = require('node-fetch');
const { loadSettings } = require('.');

const settings = loadSettings();

async function _fetch(method, path, body) {
    const res = await fetch(
        `${settings.pterodactyl.domain}/api/application/${path}`, {
            method,
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${settings.pterodactyl.key}`
            },
            body: body ? JSON.stringify(body) : null
        }
    );

    if (res.ok) {
        if (res.status === 204) return {};
        return await res.json();
    }
    return null;
}

async function fetchAccount(email) {
    return await _fetch('GET', `/users?filter[email]=${email}`);
}

async function createAccount(data) {
    return await _fetch('POST', '/users', data);
}

async function deleteAccount(email) {
    const data = await fetchAccount(email);
    if (!data) return false;
    return await _fetch('DELETE', `/users/${data.attributes.id}`);
}

module.exports = {
    fetchAccount,
    createAccount,
    deleteAccount
}
