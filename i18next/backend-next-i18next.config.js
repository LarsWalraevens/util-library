// load translations that need to come from a backend
const HttpBackend = require('i18next-http-backend/cjs');
const isProduction = process.env.NEXT_PUBLIC_ConfigState === "Production";

const path = `https://yourCDN.com/assets/public/translations/home/${isProduction ? "" : "dev_"}{{lng}}.json`;
const extraPath = require("./translation.json");

module.exports = {
    debug: false,
    use: [HttpBackend],
    backend: {
        backends: [HttpBackend],
        loadPath: path,
        backendOptions: [
            {
                expirationTime: !isProduction ? 0 : 20 * 60 * 1000 // 20 minutes
            },
        ],
        crossDomain: true,
        overrideMimeType: false,
        requestOptions: { cache: 'default' },
        parse: (data) => {
            const parsedData = JSON.parse(data);
            if (!isProduction) {
                return { ...parsedData, ...extraPath };
            };

            return parsedData;
        },
        // Used to reload resources in a specific interval (milliseconds)
        reloadInterval: 1000 * 60 * 5 // 5 minutes 
    },
    fallbackLng: "en",
    i18n: {
        // Set a default locale for the language detection during server-side rendering & so that the locale is always in the URL.
        // This "default" value helps handle scenarios where the router locale navigates to "/" and we can use middleware to redirect to the correct language
        // More info at Nextjs internationalization docs
        defaultLocale: 'default',
        locales: ['default', 'nl', 'en', 'fr'],
        localeDetection: false,
    },
    trailingSlash: true,
    serializeConfig: false,
    ns: ['translation'],
    defaultNS: 'translation',
}
