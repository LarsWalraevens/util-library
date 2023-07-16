
const project = "Project name";
const getSimpleApiRoute = (route) => route.replace(envir.Variables.API_ROUTE, "");

// handler for common HTTPS status errors - used for debugging and showing general alerts
// PROPS
// - t
// - status
// - route
// - response
// - hasAlert?
// - isSubmit?
// - submitMessage? when 200 and isSubmit, then it will show users this message instead of default
// - hideDebugLogs? hide debug logs

export function handleDebugLogsAndAlerts(props) {
    try {
        // general errors text - change to your liking
        const errorConnection = props.t ? props.t("general_connection") : "Error (connection)";
        const errorSomething = props.t ? props.t("general_error") : "Error";
        const logChanges = props.t ? props.t("save_success") : null;
        const { response, status, hasAlert, isSubmit, hideDebugLogs, submitMessage, route } = props;

        const apiStatus = response?.response?.data?.status || null;
        const apiResult = response?.response?.data || null;
        const method = response?.config?.method || null;
        const body = response?.config?.data ? JSON.parse(response.config.data) : null;

        const responseObject = {
            method,
            route,
            body,
            status,
            apiStatus,
            apiResult,
            hasAlert,
            isSubmit,
            project,
            log: ""
        };

        let methodLog = "";

        switch (status) {
            case 200:
                if (isSubmit && hasAlert) {
                    if (submitMessage) {
                        toast.success(submitMessage);
                    } else {
                        toast.success(logChanges);
                    }
                }
                break;
            case 298:
                break; // compressed data
            case 204:
            case 290:
                methodLog = "There was no data found in the request";
                responseObject.log = methodLog;
                break;
            case 400:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog = "This request had a backend error, check the server tab and call or use the debug logs";
                responseObject.log = methodLog;
                break;
            case 404:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog = "This request route was not found";
                responseObject.log = methodLog;
                break;
            case 500:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog = "This request had a SERVER error, please contact support";
                responseObject.log = methodLog;
                break;
            default:
                if (hasAlert) {
                    toast.error(errorConnection);
                }
                methodLog = "Something went wrong";
                responseObject.log = methodLog;
                break;
        }

        if (!hideDebugLogs) {
            console.log(chalk.dim.italic(`${responseObject.log} \n\n`), responseObject);
        }
    }
    catch (error) {
        console.error(`Something went wrong in handleDebugLogsAndAlerts: ${error}`)
    }
}

// Generally handles the following of a request: status, error logs, alerts
// PROPS
// - t
// - response
// - isSubmit?
// - submitMessage? - custom submitmessage for an alert to show to user
// - hasAlert?
// - setMessage? - sets absolute message in form
// - customCallback? - do stuff in handleError 

export function handleRequestError(props) {
    try {
        const { response, t, hasAlert, isSubmit, submitMessage, customCallback } = props;
        const apiStatus = !response.response || !response.response.data || response.response.data === "" ? null : response.response.data.status;
        let status = null;
        let route = null;

        if (response.request) {
            route = response.request.responseURL;
        }

        if (response.status) {
            status = parseInt(response.status);
        } else {
            if (!response.response) {
                return;
            }
            status = parseInt(response.response.status);
        }

        console.log(chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`), getSimpleApiRoute(route));

        // status can be string or something unexpected (example; axios timeout error) - if so then use the API status code
        if (status === undefined || typeof status !== "number") {
            if (!response.response || !response.response.status) { return console.log(chalk.red("handleRequestError: unexpected status errors")) }
            status = response.response.status
        }

        // steps: we want it to show debug logs, but catch custom status code in customCallback, sometimes we want to send a custom toast message,
        // this is why we do it seperately because if you THROW the custom toast msg then the next handler wont happen
        // 1. Show me only debug messages
        handleDebugLogsAndAlerts({
            t,
            status,
            route,
            response,
            // dont give hasAlert & isSubmit - we dont want to show alerts yet - because the call can expect custom ones in customCallback
        });

        // 2. CustomCallback - do stuff depending on "special" (api) status code
        // - we do general alert handling afterwards because you can throw toast messages in customCallback in order to not show the general alerts
        if (typeof customCallback === 'function') {
            customCallback();
        }

        // 3. General alerts 
        handleDebugLogsAndAlerts({
            t,
            status,
            route,
            response,
            hasAlert: props.hasAlertError !== undefined ? props.hasAlertError : props.hasAlert,
            isSubmit,
            submitMessage,
            hideDebugLogs: true,
        });
    } catch (error) {
        if (error) {
            throw new Error(`Caught - Something went wrong in the handleRequestError method - \n${error}`);
        } else {
            console.log(error);
            throw new Error(`Caught - Something went wrong in the handleRequestError method without given error message (^)`);
        }
    }
}

// Generally handles the following of a request: status, error logs, alerts, does something with data requested ("callback"/"customCallback")
// PROPS
// - t
// - response
// - isSubmit?
// - hasAlert?
// - callback -> function that does something with data
// - customCallback? - do stuff in handleError 

export function handleRequestSuccess(props) {
    try {
        const { t, response, hasAlert, isSubmit, callback, customCallback, submitMessage } = props;
        let route = null;
        let status = null;

        if (response.request) {
            route = response.request.responseURL;
        }

        if (response) {
            if (!response.status) {
                return;
            }
            status = parseInt(response.status);
        } else {
            if (!response.response) {
                return;
            }
            status = parseInt(response.response.status);
        }

        const apiStatus = response.data?.status ? parseInt(response.data.status) : null;
        const apiResult = response.data?.instance || null;
        const method = response.config?.method || null;
        const body = response.config?.data ? JSON.parse(response.config.data) : null;

        const responseObject = {
            method,
            route,
            body,
            status,
            apiStatus,
            apiResult,
            hasAlert,
            isSubmit,
            callback: typeof callback === 'function' ? callback.toString() : null,
            customCallback: customCallback ? customCallback.toString() : null,
            project,
            log: ""
        };

        console.log(chalk.bold(`✅ ${status} (${apiStatus}):`), getSimpleApiRoute(route));

        // Only want to use this for the 200 (ok) default alert - debug logs are better handled afterwards
        handleDebugLogsAndAlerts({
            t,
            status,
            route,
            response,
            hasAlert,
            isSubmit,
            submitMessage,
            hideDebugLogs: true,
        });

        // HANDLE ALL ACCEPTABLE API STATUSES & DEBUG LOGGING (200-299)
        let methodLog = "";
        if (typeof callback === 'function') {
            if (status === 298) {
                // OK but - result data is compressed - will need uncompressing in callback
                methodLog = "COMPRESSED - Callback found & was triggered";
                responseObject.log = methodLog;
                callback();
            } else {
                // !! using API STATUS here for more custom logging!
                switch (apiStatus) {
                    case 200:
                        // OK - do callback in success handler
                        methodLog = "Callback found & was triggered";
                        responseObject.log = methodLog;
                        callback();
                        break;
                    case 290:
                        // OK but - no callback, you'll have to catch this status in customCallback
                        if (customCallback) {
                            methodLog = "No main callback used (used custom) - no data";
                            responseObject.log = methodLog;
                        } else {
                            methodLog = "No callback / customCallback used - no data";
                            responseObject.log = methodLog;
                        }
                        break;
                    default:
                        // NOT OK - not a caught api status while its 200 HTTP status
                        console.error(responseObject);
                        throw new Error(`Caught - Status of api call was unexpected so an error was thrown`);
                }
            }
        } else {
            if (customCallback) {
                methodLog = "No main callback found (found custom)";
                responseObject.log = methodLog;
            } else {
                methodLog = "No callback / customCallback used";
                responseObject.log = methodLog;
            }
        }

        // do custom callback when available/given
        if (customCallback !== undefined || typeof (customCallback) === 'function') {
            customCallback();
        }

        console.log(responseObject);
    } catch (error) {
        if (error) {
            throw new Error(`Caught - Something went wrong in the handleRequestSuccess method - \n${error}`);
        } else {
            console.log(error);
            throw new Error(`Caught - Something went wrong in the handleRequestSuccess method without given error message (^)`);
        }
    }
}

export function handleRequestSettled(props) {
    const successCodes = [
        200, // OK
        290, // No data
        298 // Compressed data
    ]
    // Seperate success from error 
    if (props === undefined) {
        handleRequestError(props);
    }
    else if (successCodes.includes(props.response.status)) {
        handleRequestSuccess(props);
    } else {
        handleRequestError(props);
    }
}

// PROPS
// - key || queryKey
// - route
// - method?
// - body?
// - header?
// - enabled?
// - hasAlert?
// - hasAlertError?
// - isSubmit?
// - callback?
// - customCallback?
// - refetchOnWindowFocus?
// - select?
// - enabled?

export function useQueryFetch(props) {

    const handleDebugRequest = (res) => handleRequestSettled({
        response: res,
        hasAlertError: props.hasAlertError !== undefined ? props.hasAlertError : false,
        hasAlert: props.hasAlert !== undefined ? props.hasAlert : false,
        isSubmit: props.isSubmit !== undefined ? props.isSubmit : false,
        callback: props.callback !== undefined ? props.callback : undefined,
        customCallback: props.customCallback !== undefined ? props.customCallback : undefined
    });

    return useQuery({
        queryKey: [props.key || props.queryKey || "myKey"],
        queryFn: () => {
            if (props.method.toUpperCase() === "POST") {
                return axios.post(props.route, props.body || null, props.header || null)
                    .then(res => {
                        handleDebugRequest(res);
                        return res;
                    })

            } else {
                return axios.get(props.route)
                    .then(res => {
                        handleDebugRequest(res);
                        return res;
                    })
            }
        },
        refetchOnWindowFocus: props.refetchOnWindowFocus || false,
        // debug logs when failed - onError will be depricated in v5 of react-query so will need to find another way to debug log this
        onError: (error) => handleDebugRequest(error),
        enabled: props.enabled !== undefined ? props.enabled : false,
        retry: 3,
        select: (res) => !res ? res : res.error ? res : props.select !== undefined ? props.select : !res && !res.data.instance ? null : res.data.instance,
    })
}