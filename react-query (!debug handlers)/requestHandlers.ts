import { toast } from "react-toastify";
import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import axios from "axios";
import chalk from "chalk";
import { translate } from "./appMethods";

/**
 *  
 * ? THESE ARE HANDLERS FOR HTTP/API REQUESTS AND IS USED FOR DEBUG LOGS, GENERAL ALERT HANDLING AND DATA & STATUS HANDLING
 * ? More details can be found at the methods
 * 
    HOW IT WORKS;
    - used packages: axios, react-query, react-toastify, chalk
    - when you use react-query, you can use these handlers like this;
            useQuery({
                queryKey: ["yourKey"],
                queryFn: ()=> myAxiosGetRequest({
                    route: "yourRoute",
                    ...props
                })
            })
    - open console and look at the debug logs
 * 
 */

interface HandleDebugLogsAndAlertsProps {
    t?: any;
    status: number;
    route: string;
    response: any;
    hasAlert?: boolean;
    isSubmit?: boolean;
    submitMessage?: string;
    hideDebugLogs?: boolean;
    customCallback?: any;
    callback?: any;
}

interface RequestHandlerProps {
    response: any;
    t?: any;
    isSubmit?: boolean;
    hasAlert?: boolean;
    hasAlertError?: boolean;
    submitMessage?: string;
    customCallback?: (res: AxiosError | AxiosResponse) => void;
    callback?: (res: AxiosResponse) => void;
}

interface AxiosRequestProps extends Omit<RequestHandlerProps, "response"> {
    header?: { [key: string]: any };
    route: string;
    body?: { [key: string]: any };
}

const project = "Sethub";

const getSimpleApiRoute = (route: string) =>
    route.replace(process.env.API_URL!, "");

export function myRequestHandler(props: RequestHandlerProps) {
    // Accepted parameters of this method
    const {
        t,
        response,
        hasAlert,
        hasAlertError,
        isSubmit,
        callback,
        customCallback,
        submitMessage,
    } = props;
    var route = response.request.responseURL; // API request route
    var status = response.status || response.request.status; // HTTP status

    // ! Handle error conditional
    if (!props.response || props.response.status !== 200 || isAxiosError(props.response)) {
        try {
            // ? Debug logger
            handleDebugLogsAndAlerts({
                t,
                status,
                route,
                response,
                // ? Dont give hasAlert & isSubmit - we dont want to show alerts yet - because the call can expect custom ones in customCallback
            });

            // ? Throw something in customCallback to catch specific statuses or API statuses 
            if (customCallback) {
                customCallback(response);
            }

            // ? Now you can do this to handle general alerts
            handleDebugLogsAndAlerts({
                t,
                status,
                route,
                response,
                hasAlert: hasAlertError !== undefined ? hasAlertError : hasAlert,
                isSubmit,
                submitMessage,
                callback: callback ? callback.toString() : undefined,
                customCallback: customCallback ? customCallback.toString() : undefined,
                hideDebugLogs: true,
            });
        } catch (error) {
            if (error) {
                throw new Error(`Caught - Something went wrong - \n${error}`);
            } else {
                throw new Error(`Caught - Something went wrong ⬆️`);
            }
        }
    }

    // ! Handle success conditional
    // ? Will trigger if its 200 HTTP status and has expected props
    else {
        try {
            // ? Debug logger
            handleDebugLogsAndAlerts({
                t,
                status,
                route,
                response,
                hasAlert: hasAlertError !== undefined ? hasAlertError : hasAlert,
                isSubmit,
                submitMessage,
                callback: callback ? callback.toString() : undefined,
                customCallback: customCallback ? customCallback.toString() : undefined,
            });

            // ? Throw something in customCallback to catch specific cases or API statuses
            if (customCallback) {
                customCallback(response);
            }

            // !? Return callback function so you can manipulate the data received and use it
            return callback ? callback(response) : response.data;

        } catch (error) {
            if (error) {
                throw new Error(`Caught - Something went wrong - \n${error}`);
            } else {
                throw new Error(`Caught - Something went wrong ⬆️`);
            }
        }
    }
}

export const myAxiosGetRequest = (props: Omit<AxiosRequestProps, "body">) => {
    return axios.get(`${props.route}`, props.header || {}).then((res: AxiosResponse) => {
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the callback - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            response: res,
            callback: props.callback,
            customCallback: props.customCallback,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit
        });
    }).catch((error: AxiosError) => {
        myRequestHandler({
            response: error,
            callback: props.callback,
            customCallback: props.customCallback,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit
        });
        // ? Throw error so server state isError is true;
        throw Error("Something went wrong ⬆️")
    })
}

export const myAxiosPostRequest = (props: AxiosRequestProps) => {
    return axios.post(`${props.route}`, props.body || {}, props.header || {}).then((res: AxiosResponse) => {
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the callback - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            response: res,
            callback: props.callback,
            customCallback: props.customCallback,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit
        });
    }).catch((error: AxiosError) => {
        myRequestHandler({
            response: error,
            callback: props.callback,
            customCallback: props.customCallback,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit
        });
        // ? Throw error so server state isError is true;
        throw Error("Something went wrong ⬆️")
    })
}


export function handleDebugLogsAndAlerts(props: HandleDebugLogsAndAlertsProps) {
    try {
        // ? General messages
        const errorConnection = props.t
            ? props.t("home_extra_general_error")
            : "main_alert_error_connection";
        const errorSomething = props.t
            ? props.t("home_extra_general_error2")
            : "main_alert_error_general";
        const logChanges = props.t
            ? props.t("home_extra_save_success")
            : "main_alert_success_saved";

        var {
            response,
            status,
            hasAlert,
            isSubmit,
            hideDebugLogs,
            submitMessage,
            route,
            callback,
            customCallback,
        } = props;


        var apiStatus = response?.data?.status || null;
        var apiResult = response?.data || response?.response.data;
        var method = response?.config?.method || null;
        var body = response?.config?.data
            ? JSON.parse(response.config.data)
            : null;

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
            log: "",
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
                if (callback) {
                    methodLog = callback && customCallback ? 'Callback & customCallback found' : 'Callback found';
                    responseObject.log = methodLog;
                } else {
                    if (customCallback) {
                        methodLog = "No callback found (found customCallback)";
                        responseObject.log = methodLog;
                    } else {
                        methodLog = "No callback / customCallback";
                        responseObject.log = methodLog;
                    }
                }
                break;
            case 204:
            case 290:
                methodLog = "There was no data found in the request";
                responseObject.log = methodLog;
                break;
            case 400:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog =
                    "This request had a backend error, check the server tab and call or use the debug logs";
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
                methodLog =
                    "This request had a SERVER error, please contact support";
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
            const generalMessage = status === 200 ? chalk.bold(`✅ ${status} (${apiStatus}):`) : chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`)
            const apiRoute = getSimpleApiRoute(route);
            console.log(
                generalMessage,
                apiRoute + '\n\n',
                `${responseObject.log} \n`,
                responseObject
            );
        }
    } catch (error) {
        console.error(`Something went wrong in handleDebugLogsAndAlerts: ${error}`);
    }
}