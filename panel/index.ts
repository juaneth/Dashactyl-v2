import fetch from 'node-fetch';
import load from '../helpers/settings';
import { Response } from '../helpers/structs';

const { pterodactyl } = load();

async function _fetch<T = {}>(
    method: string,
    path: string,
    data?: object
): Promise<Response<T>> {
    const body = data ? JSON.stringify(data) : null;

    const res = await fetch(pterodactyl.url + path, {
        method,
        body,
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${pterodactyl.key}`
        }
    });

    if (res.status === 204) return {} as Response<T>;
    if ([200, 201, 202].includes(res.status)) return await res.json();
    if (res.status < 500) await res.json().then(Error);
    throw new Error(`Pterodactyl could not be contacted (status: ${res.status}).`);
}

async function getUserRaw(email: string): Promise<Response<{}>> {
    return await _fetch('GET', `/api/application/users?filter[email]=${email}`);
}

export async function getUser(email: string): Promise<{
    exists: boolean;
    admin: boolean;
}> {
    try {
        const user = await getUserRaw(email);
        return {
            exists: true,
            admin: user.attributes['root_admin']
        }
    } catch {
        return { exists: false, admin: false }
    }
}

export async function createUser(
    email: string,
    username: string,
    firstname: string,
    lastname: string,
    password: string
): Promise<boolean> {
    const user = await getUser(email);
    if (user.exists) return Promise.resolve(false);

    await _fetch(
        'POST',
        '/api/application/users',
        {
            email,
            username,
            first_name: firstname,
            last_name: lastname,
            password
        }
    );

    return true;
}

export async function deleteUser(email: string): Promise<void> {
    const user = await getUserRaw(email).catch(null);
    if (!user) return;
    await _fetch('DELETE', `/api/application/users/${user.attributes['id']}`);
}

export default {
    getUser,
    createUser,
    deleteUser
}
