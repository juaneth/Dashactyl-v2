const yaml = require('yaml');
const { join } = require('path');
const { readFileSync } = require('fs');

exports.loadSettings = function () {
    return yaml.parse(readFileSync(
        join(__dirname, '../settings.yml'),
        { encoding: 'utf-8' }
    ));
}

exports.loadPages = function () {
    const settings = this.loadSettings()
    return yaml.parse(readFileSync(
        join(__dirname, `../frontend/themes/${settings.website.theme}/pages.yml`),
        { encoding: 'utf-8' }
    ));
}