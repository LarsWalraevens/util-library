const { i18n } = require("./next-i18next.config")

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // set to false because some calls are happening twice - apparently only happens in dev env though...
    i18n,
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'wiseassets.blob.core.windows.net',
                port: '',
            },
        ],
    },
}

module.exports = nextConfig


/* 
output meaning:
'server': This value indicates that Next.js should generate a server-side rendered output. In this mode, Next.js generates HTML on the server and sends it to the client upon each request.
'static': This value indicates that Next.js should generate a static output. In this mode, Next.js pre-renders all pages at build time and generates static HTML files. These files can be served directly by a CDN or a static hosting service.
'minimal': This value indicates that Next.js should generate a minimal output. In this mode, Next.js only includes the necessary JavaScript and CSS files for each page. It doesn't include any pre-rendered HTML or additional assets.
'standalone': This value indicates that Next.js should generate a standalone output. This mode is similar to the 'static' mode, but it includes all the necessary runtime JavaScript files. This allows the generated site to work offline and be self-contained.

---

Server: This option generates a server-rendered application. When a user visits your website, the server dynamically generates the HTML content and sends it to the user's browser. This is suitable for applications with real-time data fetching and frequently changing content.
Static: This option generates a fully static version of your application. It pre-renders all pages during the build process, creating HTML files for each page. These pre-generated HTML files are served directly from a CDN or a static file hosting service. This option is ideal for content that doesn't change frequently and doesn't require real-time data.
Standalone: This option is similar to the "Server" option, but it includes an embedded version of React. It allows your application to be self-contained and doesn't rely on external React libraries. This option is useful if you want to deploy your application in an environment where the external React library might not be available.
Minimal: This option is a smaller version of the "Server" option. It includes only the minimum necessary code to run the application. It's useful if you want to reduce the bundle size and optimize performance. However, it may have limitations and may not support all features of the "Server" option.
*/