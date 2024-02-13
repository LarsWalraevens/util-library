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

interface WiseApiResponse {
    data: any;
    condition: number;
    details: string | null;
    isDataCompressed: boolean;
    reflection: any;
}
export type AxiosCombinedResponse = AxiosResponse<WiseApiResponse>;

interface HandleDebugLogsAndAlertsProps {
    t: any;
    status: number;
    route: string;
    response: AxiosError | AxiosCombinedResponse;
    hasAlert?: boolean;
    isSubmit?: boolean;
    submitMessage?: string;
    hideDebugLogs?: boolean;
    onResponse?: any;
    transformResponseData?: any; // ? This can be any because its converted to string
    information?: { [key: string]: any };
}

interface RequestHandlerProps {
    response: AxiosError | AxiosCombinedResponse;
    t: (key: string) => void;
    isSubmit?: boolean;
    hasAlert?: boolean;
    hasAlertError?: boolean;
    hideDebugLogs?: boolean;
    submitMessage?: string;
    onResponse?: (res: AxiosError | AxiosCombinedResponse) => void;
    transformResponseData?: (res: AxiosCombinedResponse) => Array<any> | { [key: string]: any } | null; // ! If you use this, you'll need to return something, else you might get a react-query error!
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
    var apiStatus = isAxiosError(response) ? ((response.response?.data as WiseApiResponse).condition || response.response?.status) : ((response.data as WiseApiResponse).condition || response.status || null);

    const successCodes = [
        200, // OK
        // 290, // No data
        // 298 // Compressed data
    ]

    // ! Handle error conditional
    if (!props.response || props.response.status !== 200 || !successCodes.includes(status) || isAxiosError(props.response) || apiStatus !== 200) {
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
            return transformResponseData ? transformResponseData(response as AxiosResponse) : !(response as AxiosResponse) && !(response as AxiosResponse).data.data ? null : (response as AxiosResponse).data.data === "No Data" ? null : (response as AxiosResponse).data.data;

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
        // ? Throw error so server state isError is true;
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
        console.error(error);
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
        // ? Throw error so server state isError is true;
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
        console.error(error);
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

        var apiResponse = !isAxiosError(response) ? response?.data : (response?.response?.data);
        var apiStatus = isAxiosError(response)
            ? ((response.response?.data as WiseApiResponse).condition || response.response?.status)
            : ((response.data as WiseApiResponse).condition || response.status || null);
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
                // ! API status also has to be 200
                if (isSubmit && hasAlert && apiStatus === 200) {
                    if (submitMessage) {
                        toast.success(submitMessage);
                    } else {
                        toast.success(logChanges);
                    }
                } else if ((apiStatus !== 200 || !apiStatus) && hasAlert) {
                    toast.error(errorSomething);
                }
                if (apiStatus === 200) {
                    methodLog = transformResponseData ? 'transformResponseData (found)' : 'transformResponseData (NOT FOUND)';
                    debugObject.log = methodLog;
                } else {
                    methodLog = transformResponseData ? 'transformResponseData (found) did not trigger because API status was NOT OK' : "Api status was NOT OK"
                    debugObject.log = methodLog;

                }
                break;
            case 400:
                if (hasAlert) {
                    toast.error(errorSomething);
                }
                methodLog = "This request had a backend error, check the server tab and call or use the debug logs";
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
                methodLog = "This request had a SERVER error, please contact support";
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
        debugObject.log = `${debugObject.log} && ${onResponse ? 'onResponse (found)' : 'onResponse (NOT FOUND)'}`

        if (!hideDebugLogs && showDebugLogs) {
            const generalMessage = status === 200 && apiStatus === 200 ? chalk.bold(`✅ ${status} (${apiStatus}):`) : chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`)
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
