import { Helmet } from "react-helmet";

// set title, description and keywords meta tags of a page
export function setPageSeo(title, description, keywords) {
    return <Helmet
        title={title}
        meta={[
            {
                name: `description`,
                content: description
            },
            {
                name: `keywords`,
                content: keywords
            },
            {
                property: "og:title",
                content: title
            },
            {
                property: "og:description",
                content: description
            },
            {
                property: "twitter:title",
                content: title
            },
            {
                property: "twitter:description",
                content: description
            },
        ]}
    ></Helmet>
}