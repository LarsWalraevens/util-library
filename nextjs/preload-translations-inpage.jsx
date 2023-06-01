// preloading translations has to happen in EACH PAGE
// with the use of getStaticProps / getServerProps
import i18nextConfig from 'next-i18next.config';

// regular page
export const getStaticProps = async ({ locale }) => ({
    props: {
        ...await serverSideTranslations(locale, ["translation"]),
    },
})

// [dynamic page]
const getStaticProps = async (ctx) => {
    const locale = ctx.locale || i18nextConfig.i18n.defaultLocale;
    const translations = await serverSideTranslations(locale, ["translation"]);

    return {
        props: {
            ...translations,
        },
    };
};

export const getStaticPaths = ({ locale }) => {
    const thePaths = i18nextConfig.i18n.locales.map((lng) => ({
        params: {
            locale: lng,
            shortcode: "*",
        },
    }));

    return {
        paths: thePaths,
        fallback: 'blocking',
    };
};


/* fallback explained:
In Next.js, the fallback property controls the behavior when a requested page is not pre-rendered at build time. It can have three possible values:
false: This means that any path that is not defined in the paths array will result in a 404 page. If a user requests a page that is not pre-rendered, Next.js will return a 404 error.
true: With this value, any path that is not defined in the paths array will be handled as a dynamic route. Next.js will generate the page on-demand, at the first request, and cache the result for future requests.
'blocking': This option is similar to true, but the page generation will happen on the server before sending the response to the client. The client will wait for the page to be generated before rendering it.
*/