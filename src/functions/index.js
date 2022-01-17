const yaml = require('yaml');
const { join } = require('path');
const { readFileSync } = require('fs');

function loadSettings() {
    return yaml.parse(readFileSync(
        join(__dirname, '../settings.yml'),
        { encoding: 'utf-8' }
    ));
}

function loadPages() {
    const settings = loadSettings();
    return yaml.parse(readFileSync(
        join(__dirname, `../frontend/themes/${settings.website.theme}/pages.yml`),
        { encoding: 'utf-8' }
    ));
}

module.exports = {
    loadSettings,
    loadPages
}
