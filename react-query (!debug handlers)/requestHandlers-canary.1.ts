import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
// @ts-ignore
import chalk from "chalk";
import { toast } from "react-toastify";
import envir from '../../env.json';
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
                queryFn: ()=> sendAxiosGetRequest({
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
    onResponse?: any;
    transformResponseData?: any;
    information?: { [key: string]: any };
}

interface RequestHandlerProps {
    response: any;
    t: (key: string) => void;
    isSubmit?: boolean;
    hasAlert?: boolean;
    hasAlertError?: boolean;
    hideDebugLogs?: boolean;
    submitMessage?: string;
    onResponse?: (res: AxiosError | AxiosResponse) => void;
    transformResponseData?: (res: AxiosResponse) => Array<any> | { [key: string]: any } | null; // ! If you use this, you'll need to return something, else you might get a react-query error!
    information?: { [key: string]: any }; // Log extra client states for more information
}

interface AxiosRequestProps extends Omit<RequestHandlerProps, "response"> {
    header?: { [key: string]: any };
    route: string;
    body?: { [key: string]: any };
}

const project = "WiSE Office";

const getSimpleApiRoute = (route: string) =>
    route.replace(envir.Variables.WiseApiUrl, "");

export function myRequestHandler(props: RequestHandlerProps) {
    // Accepted parameters of this method
    const {
        t,
        response,
        hasAlert,
        hasAlertError,
        isSubmit,
        transformResponseData,
        onResponse,
        submitMessage,
        hideDebugLogs,
        information
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
                information
                // ? Dont give hasAlert & isSubmit - we dont want to show alerts yet - because the call can expect custom ones in onResponse
            });

            // ? Throw something in onResponse to catch specific statuses or API statuses 
            if (onResponse) {
                onResponse(response);
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
                transformResponseData: transformResponseData ? transformResponseData.toString() : undefined,
                onResponse: onResponse ? onResponse.toString() : undefined,
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
                transformResponseData: transformResponseData ? transformResponseData.toString() : undefined,
                onResponse: onResponse ? onResponse.toString() : undefined,
                hideDebugLogs: props.hideDebugLogs === true && props.hideDebugLogs !== undefined ? true : false,
                information
            });

            // ? Throw something in onResponse to catch specific cases or API statuses
            if (onResponse) {
                onResponse(response);
            }

            // !? Return transformResponseData function so you can manipulate the data received and use it
            return transformResponseData ? transformResponseData(response) : !response && !response.data.data ? null : response.data.data === "No Data" ? null : response.data.data;

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
        // ? If status is ok, it will return whatever is in the transformResponseData - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            t: props.t,
            response: res,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information

        });
    }).catch((error: AxiosError) => {
        myRequestHandler({
            t: props.t,
            response: error,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information
        });
        // ? Throw error so server state isError is true;
        throw Error("Something went wrong ⬆️")
    })
}

export const sendAxiosPostRequest = (props: AxiosRequestProps) => {
    return axios.post(`${props.route}`, props.body || {}, props.header || {}).then((res: AxiosResponse) => {
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the transformResponseData - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            t: props.t,
            response: res,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information
        });
    }).catch((error: AxiosError) => {
        myRequestHandler({
            t: props.t,
            response: error,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information
        });
        // ? Throw error so server state isError is true;
        throw Error("Something went wrong ⬆️")
    })
}


export function handleDebugLogsAndAlerts(props: HandleDebugLogsAndAlertsProps) {
    try {
        // ? (console) Debug-logs toggler for request handle
        const showDebugLogs: boolean = true;
        // const showDebugLogs: boolean = Boolean(envir.Variables.DisableConsole);

        // ? General messages
        const errorSomething = "Something went wrong, please try again or check the logs";
        const errorConnection = "A connection error occured";
        const logChanges = "Successfully made changes";

        var {
            response,
            status,
            hasAlert,
            isSubmit,
            hideDebugLogs,
            submitMessage,
            route,
            transformResponseData,
            onResponse,
            information
        } = props;

        var apiResponse = response?.data || (response?.response?.data ?? null);
        var apiStatus = response?.response?.data.condition || response?.data?.condition || response?.response?.status || null;
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
                transformResponseData: transformResponseData ? transformResponseData.toString() : null,
                onResponse: onResponse ? onResponse.toString() : null,
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
                if (transformResponseData) {
                    methodLog = transformResponseData && onResponse ? 'transformResponseData & onResponse found' : 'transformResponseData found';
                    debugObject.log = methodLog;
                } else {
                    if (onResponse) {
                        methodLog = "No transformResponseData found (found onResponse)";
                        debugObject.log = methodLog;
                    } else {
                        methodLog = "No transformResponseData / onResponse";
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
            if (information) debugObject["🔍 information"] = information

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
