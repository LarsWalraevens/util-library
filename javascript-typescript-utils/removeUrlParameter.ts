
/**
 * 
 * Remove url parameter item from URL parameters and returns it
 * @param key To remove parameter
 * @param sourceURL The url with parameters
 * @returns The url without the given parameter
 * 
 */
export function removeUrlParameter(key: string, sourceURL: string): string {
    try {
        const rtn = sourceURL.split("?")[0];
        const queryString = sourceURL.includes("?") ? sourceURL.split("?")[1] : "";
        const params_arr = queryString.split("&");

        for (let i = params_arr.length - 1; i >= 0; i -= 1) {
            const param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }

        return params_arr.length ? `${rtn}?${params_arr.join("&")}` : rtn;
    } catch (error) {
        console.error(error);
        return sourceURL;
    }
}