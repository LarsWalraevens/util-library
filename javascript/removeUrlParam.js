// remove item from url parameter
// key = urlParam item to remove
// sourceUrl = myurl.com/?param1=item&param2=item2

export function removeParam(key, sourceURL) {
    try {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
        }

        return rtn;
    }
    catch (error) {
        console.error(error)
    }
}