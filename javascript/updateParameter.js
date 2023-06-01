// update url search parameter
// key = urlParam item
// val = new value
// url? = url to use 
// return = new url/uri
export function updateParameter(key, val, url) {
    var search = window.location.search;
    if (url) {
        search = url;
    }
    var regex = new RegExp("([?;&])" + key + "[^&;]*[;&]?");
    var query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 1 ? query + "&" : "?") + (val ? key + "=" + val : '');
}