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
    t: any;
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
    t: (key: string) => void;
    isSubmit?: boolean;
    hasAlert?: boolean;
    hasAlertError?: boolean;
    submitMessage?: string;
    customCallback?: (res: AxiosError | AxiosResponse) => void;
    callback?: (res: AxiosResponse) => Array<any> | { [key: string]: any } | null; // ! If you use this, you'll need to return something, else you might get a react-query error!
}

interface AxiosRequestProps extends Omit<RequestHandlerProps, "response"> {
    header?: { [key: string]: any };
    route: string;
    body?: { [key: string]: any };
}

const project = "YOUR PROJECT";

const getSimpleApiRoute = (route: string) =>
    route.replace(process.env.API_URL, "");

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
    var route = !response ? "NO RESPONSE" : !response.request ? "NO REQUEST" : response.request.responseURL; // API request route
    var status = response.request ? response.request.status : response.status; // HTTP status

    const successCodes = [
        200, // OK
        290, // No data
        298 // Compressed data
    ]

    // ! Handle error conditional
    if (!props.response || props.response.status !== 200 || !successCodes.includes(response.status) || isAxiosError(props.response)) {
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

            // return null for HTTP status 298 case in useAdvancedsearch
            if (response.status === 298) {
                return null;
            }
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
            return callback ? callback(response) : !response && !response.data ? null : response.data === "No Data" ? null : response.data.instance;

        } catch (error) {
            if (error) {
                throw new Error(`Caught - Something went wrong - \n${error}`);
            } else {
                throw new Error(`Caught - Something went wrong ⬆️`);
            }
        }
    }
}

export const sendAxiosGetRequest = (props: Omit<AxiosRequestProps, "body">) => {
    return axios.get(`${props.route}`, props.header || {}).then((res: AxiosResponse) => {
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the callback - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            t: props.t,
            response: res,
            callback: props.callback,
            customCallback: props.customCallback,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit
        });
    }).catch((error: AxiosError) => {
        myRequestHandler({
            t: props.t,
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

export const sendAxiosPostRequest = (props: AxiosRequestProps) => {
    return axios.post(`${props.route}`, props.body || {}, props.header || {}).then((res: AxiosResponse) => {
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the callback - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            t: props.t,
            response: res,
            callback: props.callback,
            customCallback: props.customCallback,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit
        });
    }).catch((error: AxiosError) => {
        myRequestHandler({
            t: props.t,
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
        // ? (console) Debug-logs toggler for request handle
        const showDebugLogs: boolean = Boolean(envir.Variables.DisableConsole);

        // ? General messages
        const errorConnection = props.t
            ? props.t("home_extra_general_error")
            : "Error (connection)";
        const errorSomething = props.t
            ? props.t("home_extra_general_error2")
            : "Error";
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

        var apiStatus = response?.data?.status ?? null;
        var apiResponse = response?.data || (response?.response?.data ?? null);
        var method = response?.config?.method ?? null;
        var body = response?.config?.data
            ? JSON.parse(response.config.data)
            : null;

        // ? Customise your debug log object here
        var debugObject: { [key: string]: any } = {
            ["📡 request"]: {
                method,
                route,
                body,
            },
            ["📩 response"]: {
                httpStatus: status,
                // httpResponse: response, // If you want to see the whole RAW response
                apiStatus,
                apiResponse,
            },
            ["🛠️ settings"]: {
                hasAlert,
                isSubmit,
                callback: callback ? callback.toString() : null,
                customCallback: customCallback ? customCallback.toString() : null,
                project,
            },
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
                    debugObject.log = methodLog;
                } else {
                    if (customCallback) {
                        methodLog = "No callback found (found customCallback)";
                        debugObject.log = methodLog;
                    } else {
                        methodLog = "No callback / customCallback";
                        debugObject.log = methodLog;
                    }
                }
                break;
            case 204:
            case 290:
                methodLog = "There was no data found in the request";
                debugObject.log = methodLog;
                break;
            case 400:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog =
                    "This request had a backend error, check the server tab and call or use the debug logs";
                debugObject.log = methodLog;
                break;
            case 404:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog = "This request route was not found";
                debugObject.log = methodLog;
                break;
            case 500:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog =
                    "This request had a SERVER error, please contact support";
                debugObject.log = methodLog;
                break;
            default:
                if (hasAlert) {
                    toast.error(errorConnection);
                }
                methodLog = "Something went wrong";
                debugObject.log = methodLog;
                break;
        }

        if (!hideDebugLogs && showDebugLogs) {
            const generalMessage = status === 200 ? chalk.bold(`✅ ${status} (${apiStatus}):`) : chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`)
            const apiRoute = getSimpleApiRoute(route);
            const log = debugObject.log;
            delete debugObject.log;

            console.log(
                generalMessage,
                apiRoute + '\n\n',
                `${log} \n`,
                debugObject
            );
        }
    } catch (error) {
        console.error(`Something went wrong in handleDebugLogsAndAlerts: ${error}`);
    }
}
