// simple check if link has http in there, if not the it adds it
export function getValidLink(link) {
    if (link.includes("http")) {
        return link;
    } else {
        return "http://" + link;
    }
}