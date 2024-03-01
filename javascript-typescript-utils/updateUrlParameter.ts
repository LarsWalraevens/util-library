/**
 * 
 * Update URL search parameter of given or current url
 * @param key
 * @param val 
 * @param url Use this url or current url 
 * @returns Url with updated parameter
 * 
 */
export function updateParameter(key: string, val: string | number | Array<any>, url?: string): string {
    const search = url ? url : window.location.search;
    const regex = new RegExp(`([?;&])${key}[^&;]*[;&]?`);
    const query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 1 ? `${query}&` : "?") + (val ? `${key}=${val}` : '');
}
