// next-i18next.config.js
module.exports = {
    // ...,
    fallbackLng: "en",
    i18n: {
        // Set a default locale for the language detection during server-side rendering & so that the locale is always in the URL.
        // This "default" value helps handle scenarios where the router locale navigates to "/"
        // and allows catching language changes when users navigate to a different language.
        defaultLocale: 'default',
        locales: ['default', 'nl', 'en', 'fr'],
        localeDetection: false,
    },
    trailingSlash: true,
    serializeConfig: false,
    // ...,
}

// You page.tsx
export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const locale = ctx.locale || nextI18nextConfig.i18n.defaultLocale;
    const cookies = cookie.parse(ctx.req.headers.cookie || '');
    const userLang = cookies[LOCAL_STORAGE.LANGUAGE];
    const myUrlWithoutLocal = ctx.resolvedUrl ? ctx.resolvedUrl.replace(`/${locale}`, '') : '/';

    // ? Navigate to proper locale page, if locale is value "default" (more info at nextI18nextConfig) then redirect to actual default locale "nl"
    if (locale === nextI18nextConfig.i18n.defaultLocale) {
        return {
            redirect: {
                statusCode: 307,
                destination: `/${userLang || 'nl'}${myUrlWithoutLocal}`,
            },
        };
    }

    const translations = await serverSideTranslations(locale, ['translation']);
    return {
        props: {
            ...translations,
        },
    };
};

// DONT FORGET Safeguard catch "default" locale value in your app-wrapper.tsx
// {
//     router.locale === "default" ? <Loading redirect="/nl" center fullscreen /> : <App />
// }

// Catch language in client (app-wrapper.tsx), for example;
const useCatchLanguageChangeInRouter = (): ReturnType<typeof useEffect> => {
    const router = useRouter();
    const userStore = useUserStore();
    const translationStore = useTranslationStore();

    const mutateEditLang = useEditLanguage(true);

    return useEffect(() => {
        if (!router.locale || router.locale === "default") router.push("/nl");
        if (!translationStore.languages) return
        if (userStore.userData) {
            const languagesFilter: Language[] = translationStore.languages.filter(lang => lang.isoCode.toLowerCase() === router.locale!.toLowerCase());
            var newLanguageData: Language | null = languagesFilter.length === 0 ? null : languagesFilter[0];
            if (!newLanguageData) return

            // if language is not the same as the current language
            if (userStore.userData.language.id !== newLanguageData.id) {
                // change language in userStore
                userStore.changeUserLanguage({ isoCode: newLanguageData.isoCode, name: newLanguageData.name, id: newLanguageData.id })

                // change language in database
                mutateEditLang.mutate({
                    newIso: newLanguageData.isoCode
                })
            }

            // change language in local storage
            if (localStorage.getItem(LOCAL_STORAGE.LANGUAGE) && userStore.userData.language.isoCode.toLowerCase() !== localStorage.getItem(LOCAL_STORAGE.LANGUAGE)?.toLowerCase()) {
                localStorage.setItem(LOCAL_STORAGE.LANGUAGE, userStore.userData.language.isoCode.toLowerCase()); // overwrite
            } else {
                localStorage.setItem(LOCAL_STORAGE.LANGUAGE, newLanguageData.isoCode.toLowerCase());
                localStorage.setItem(LOCAL_STORAGE.LANGUAGE_ID, newLanguageData.id.toLowerCase());
            }

            // change language in cookies
            setAppCookies({
                language: newLanguageData.isoCode.toLowerCase()
            })
        }
    }, [router.locale, userStore.userData, translationStore.languages])
}
