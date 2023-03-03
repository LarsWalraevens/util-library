
// handler for common HTTPS status errors - used for debugging and showing general alerts
export function handleHttpStatus(props) {
    // GENERAL MESSAGES 
    const errorConnection = t("business_extra_general_error1");
    const errorSomething = t("business_extra_general_error2");
    const logChanges = t("business_extra_save_succes");
    try {
        var route = props.route;
        const apiStatus = !props.response.response || !props.response.response.data.status ? null : props.response.response.data.status;
        const apiResult = !props.response.response || !props.response.response.data ? null : props.response.response.data;
        const method = props.response.config.method;
        const responseObject = { project, route, status: props.status, method, body: props.response.config.data ? JSON.parse(props.response.config.data) : null, apiStatus: apiStatus, apiResult: apiResult };
        switch (props.status) {
            case 200:
                if (Boolean(props.isSubmit) === true) {
                    toast.success(logChanges);
                }
                break;
            // COMPRESSED
            case 298: break;
            case 204:
            case 290:
                if (props.hideLogs) { break; } else {
                    return console.warn(`${props.status}: There was no data found in the request \n`, responseObject)
                }
            case 400:
                if (Boolean(props.hasAlert)) {
                    toast.error(errorSomething);
                }
                if (props.hideLogs) { break; } else {
                    return console.error(`${props.status}${props.response.response.data.status ? ' - ' + props.response.response.data.status + " (api)" : ''}: This request had a backend error, check the server tab and call or use data below  \n`,
                        responseObject);
                }
            case 404:
                if (Boolean(props.hasAlert)) {
                    toast.error(errorSomething);
                }
                if (Boolean(props.hideLogs)) {
                    return console.error(`${props.status}: This request route was not found \n`, responseObject)
                }
                break;
            case 500:
                if (Boolean(props.hasAlert) === true) {
                    toast.error(errorSomething);
                }
                if (Boolean(props.hideLogs)) { break; } else {
                    return console.error(`${props.status}: This request had a SERVER error, please contact support \n`, responseObject);
                }
            default:
                if (Boolean(props.hasAlert)) {
                    toast.error(errorConnection);
                }
                if (Boolean(props.hideLogs)) { break; } else {
                    return console.error(`${props.status}: Something went wrong \n`, responseObject);
                }
        }
    } catch (error) {
        throw Error(error)
    }
}

// Generally handles the following of a request: status, error logs, alerts
// PROPS
// - response
// - isSubmit?
// - hasAlert?
// - setMessage? - sets absolute message in form
// - customCallback? - do stuff in handleError 
export function handleRequestError(props) {
    // GENERAL MESSAGES 
    const errorConnection = t("business_extra_general_error1");
    const errorSomething = t("business_extra_general_error2");
    const logChanges = t("business_extra_save_succes");
    try {
        var status = null;
        var route = null;
        if (props.response.request) {
            route = props.response.request.responseURL;
        }
        if (props.response.request) {
            route = props.response.request.responseURL;
        }
        if (props.response.status) {
            status = parseInt(props.response.status);
        } else {
            if (!props.response.response) { return }
            status = parseInt(props.response.response.status)
        }

        // log what method is triggered
        if (props.ref !== "callback") {
            console.log(chalk.bgRed(`Method handleRequestError`), getSimpleApiRoute(route))
            // console.log({ info: { route, callData: props.response, page: window.location.pathname, date: new Date() } })
        }
        // status can be string or something unexpected - if so then use the status code given by backend
        if (status === undefined || typeof status !== "number") {
            if (!props.response.response || !props.response.response.status) { return console.log(chalk.red("handleError: unexpected status errors")) }
            status = props.response.response.status
        }

        // handler for common HTTPS status - these status handlers CAN NOT throw errors (catch them in customCallback or callback if 200 is expected), they are only ment to show console logs for debugging
        handleHttpStatus({
            status: status,
            route: route,
            response: props.response,
        });

        // !!! ALERT HANDLER -> handle all status errors
        // 1. in custom callback THROW ERRORS so that the default one doesnt show
        if (props.customCallback !== undefined || typeof (props.customCallback) === 'function') {
            props.customCallback();
        }
        // 2. general https errors
        handleHttpStatus({
            status: status,
            route: route,
            response: props.response,
            hasAlert: props.hasAlert,
            isSubmit: props.isSubmit,
            hideLogs: true,
        });

        // !!! HANDLE ALL ACCEPTABLE STATUSES THAT ARE 200-299 -> else it will throw an error
        // this is important because of the current server state management (react-query):
        // - for isSuccess means the following cases is true 
        // - for onSuccess means the following cases is true 
        switch (status) {
            case 200:
                console.log(chalk.greenBright(`${status}: callback request ↓`))
                break;
            case 290:
                console.log(chalk.greenBright(`${status}: callback request - no data found - ${route}`))
                break;
            // COMPRESSED
            case 298:
                console.log(chalk.greenBright(`${status}: callback request - compressed data - ${route}`))
                break;
            // ELSE THROW ERROR
            default:
                throw new Error(`Status of call was unexpected so an error was thrown`)
        }
    } catch (error) {
        if (props.ref) {
            console.warn("used in ref:", props.ref);
        }
        if (error) {
            if (props.setMessage !== undefined) {
                props.setMessage([errorConnection, "danger"]);
            }
            throw new Error(`Something went wrong in the handleRequestError method - \n${error}`);
        } else {
            throw new Error(`Something went wrong in the handleRequestError method without given error message (^)`);
        }
    }
}

// Generally handles the following of a request: status, error logs, alerts + does something with data requested
// PROPS
// - response
// - callback -> function that does something with data
// - isSubmit?
// - setMessage? - sets absolute message in form
// - hasAlert?
// - customCallback? - do stuff in handleError 
export function handleRequestSuccess(props) {
    // GENERAL MESSAGES 
    const errorConnection = t("business_extra_general_error1");
    const errorSomething = t("business_extra_general_error2");
    const logChanges = t("business_extra_save_succes");
    try {
        var route = null;
        if (props.response.request) {
            route = props.response.request.responseURL;
        }
        var status = null;
        if (props.response) {
            if (!props.response.status) { return }
            status = parseInt(props.response.status);
        } else {
            if (!props.response.response) { return }
            status = parseInt(props.response.response.status)
        }
        var apiStatus = props.response.data.status ? parseInt(props.response.data.status) : null;
        var apiResult = props.response.data.instance ? props.response.data.instance : null;
        const method = props.response.config.method;
        const responseObject = { project, status, method, body: props.response.config.data ? JSON.parse(props.response.config.data) : null, apiStatus, apiResult, route, callback: typeof (props.callback) === 'function' ? props.callback.toString() : null, customCallback: props.customCallback ? props.customCallback.toString() : null };
        console.log(chalk.bgBlueBright(`Method handleRequestSuccess`), getSimpleApiRoute(route));

        // first handle:
        // - any errors
        // - debug logs
        // - alerts
        // - customcallbacks -> this is used to handle and catch cases from the call where you want to THROW something, for example, an throw an alert so that the callback WONT trigger
        handleRequestError({
            response: props.response, hasAlert: props.hasAlert, isSubmit: props.isSubmit, customCallback: props.customCallback, ref: "callback"
        });
        // !!! HANDLE ALL ACCEPTABLE API STATUSES THAT ARE 200-299 -> else it will throw an error
        // this is important because of the current server state management (react-query):
        // - for isSuccess means the following cases is true 
        // - for onSuccess means the following cases is true 
        if (typeof (props.callback) === 'function') {
            if (parseInt(status) === 298) {
                console.log(chalk.green(`Callback found & was triggered\n`), responseObject)
                props.callback();
            } else {
                switch (apiStatus) {
                    // ONLY CASE 200 WILL DO THE CALLBACK
                    case 200:
                        console.log(chalk.green(`Callback found & was triggered\n`), responseObject)
                        props.callback();
                        break;
                    // case 298:
                    //     console.log(chalk.green(`Callback found & was triggered\n`), responseObject)
                    //     props.callback();
                    //     break;
                    case 290:
                        if (props.customCallback) {
                            console.log(chalk.green(`No main callback used (used custom) - no data \n`), responseObject)
                        } else {
                            console.log(chalk.green(`No callback / customCallback used - no data \n`), responseObject)
                        }
                        break;
                    // ELSE THROW ERROR
                    default:
                        console.error(responseObject);
                        throw new Error(`Status of api call was unexpected so an error was thrown`);
                }
            }
        }
        else {
            if (props.customCallback) {
                console.log(chalk.green(`No main callback found (found custom) \n`), responseObject)
            } else {
                console.log(chalk.yellow(`Callback not found \n`), responseObject)
            }
        }
    } catch (error) {
        if (error) {
            throw new Error(`Something went wrong in the handleRequestSuccess method - \n${error}`);
        } else {
            console.log(error);
            throw new Error(`Something went wrong in the handleRequestSuccess method without given error message (^)`);
        }
    }
}
