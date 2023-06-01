// update url search parameter
export function updateParameter(key, val) {
    var uri = window.location.pathname + window.location.search
        .replace(RegExp("([?&]" + key + "(?=[=&#]|$)[^#&]*|(?=#|$))"), "&" + key + "=" + encodeURIComponent(val))
        .replace(/^([^?&]+)&/, "$1?");
    return uri;
}