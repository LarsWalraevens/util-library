// load translations that need to come from a backend
const I18NextHttpBackend = require('i18next-http-backend/cjs');
const envir = require("./env.json");

// { key: value, ... }
const devPath = "https://your-api.com/assets/public/translations/home/dev_{{lng}}.json";
const prodPath = "https://your-api.com/assets/public/translations/home/{{lng}}.json";

module.exports = {
    i18n: {
        locales: ['en', 'fr', 'nl'],
        defaultLocale: 'nl',
        localeDetection: false,
    },
    backend: {
        loadPath: envir.Variables.ConfigState === "Production" ? prodPath : devPath,
        parse: (data) => {
            const parsedData = JSON.parse(data);
            return parsedData;
        }
    },
    serializeConfig: false,
    use: [I18NextHttpBackend],
    ns: ['translation'],
    defaultNS: 'translation'
}