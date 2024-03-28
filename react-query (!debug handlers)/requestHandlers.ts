import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import chalk from "chalk";
import { toast } from "react-toastify";
import { HttpErrorLoggerProps, saveErrorInLogs } from "./requestErrorLogger";

/**
 * 
 * ############################################################################
 *  
 * These are handlers for http/api requests and is used for things like:
 * - data handling from calls (prop: transformResponseData)
 * - api status handling (prop: onResponse)
 * - debug logs 
 * - log errors to the database
 * - general alert handling 
 * - more...
 * 
 * More details can be found at the methods
 * 
 * ############################################################################
 */


/**
 * Sends an axios get request with addition plugins like transform response data, debug logs, alerts, etc
 * 
 * @param route - API route to send the request
 * @param header - header of the request
 * @param t - translation function
 * @param onResponse - Callback - Do something when you get any response (AxiosResponse | AxiosError)
 * @param transformResponseData - Callback - Manipulate returned data
 * @param hasAlert - whether to show an alert to user
 * @param submitMessage - message to show on submit (200 codes only)
 * @param isSubmit - whether to show submit button
 * @param hideDebugLogs - whether to hide debug logs
 * @param information - debug information for more context (object type)
 * @param errorLogger - error logger that logs errors to server
 * 
 * @example 
 * useQuery({
        queryFn: () => sendAxiosGetRequest({
        route: `v2/generic/catalogues/Languages`,
        t,
        errorLogger: {
            doLogHandlerErrors: false,
            props: {
                mutateClientErrorLogger,
                router,
                userStore
            }
        },
        onResponse: (res) => {
            if (res && !isAxiosError(res) && res.data.data) toast.success("Success");
        },
        transformResponseData: (res) => {
            return res.data.data.filter((item: any) => item.disabled === false);
        }
        }),
        ...
    });
  * 
 */
export const sendAxiosGetRequest = (props: Omit<AxiosRequestProps, "body">) => {
    return axios.get(`${props.route}`, props.header || {}).then((res: AxiosResponse) => {
        return myRequestHandler({
            t: props.t,
            response: res,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information,
            errorLogger: props.errorLogger
        });
    }).catch((error: AxiosError) => {
        const errorLogger = props.errorLogger;

        // ? Log the errors in BE - seperate them by use cases
        if (error && (error.response && error.response.status !== 200)) {
            sendErrorLogHttp({
                errorLogger: errorLogger,
                response: error,
                route: props.route,
                httpStatus: error.response && error.response.status ? error.response.status : undefined,
                id: "sendAxiosGetRequest-sendErrorLogHttp-catch"
            });
            // We need to show the client error logs for debugging - it didnt happen in myRequestHandler beceause it was throwing an error
            doMyResponseClientLogs({
                t: props.t,
                response: error,
                information: props.information,
            });
        } else if (error && error.code) {
            sendErrorLogNetwork({
                errorLogger,
                response: error,
                route: props.route
            });
        } else {
            sendErrorLogHandler({
                errorLogger: errorLogger,
                response: error,
                route: props.route,
                onResponse: props.onResponse,
                transformResponseData: props.transformResponseData,
                id: "sendAxiosGetRequest-sendErrorLogHandler-catch"
            });
        }
        console.error(error);
        // ? Throw error so server state isError is true;
        throw Error("Something went wrong ⬆️")
    })
}

/**
 * Sends an axios post request with addition plugins like transform response data, debug logs, alerts, etc
 * 
 * @param route - API route to send the request
 * @param body - body of the request
 * @param header - header of the request
 * @param t - translation function
 * @param onResponse - Callback - Do something when you get any response (AxiosResponse | AxiosError)
 * @param transformResponseData - Callback - Manipulate returned data
 * @param hasAlert - whether to show an alert to user
 * @param submitMessage - message to show on submit (200 codes only)
 * @param isSubmit - whether to show submit button
 * @param hideDebugLogs - whether to hide debug logs
 * @param information - debug information for more context (object type)
 * @param errorLogger - error logger that logs errors to server
 * 
 * @example
 * useMutation({
    mutationFn: (propsFn: { newIso: string }) => sendAxiosPostRequest({
      route: `v1/update/users/${userStore.userData?.id}/languages`,
      t,
      body: {
        Iso: propsFn.newIso
      },
      onResponse: (res) => {
        if (!isAxiosError(res)) {
            if (router.locales?.includes(propsFn.newIso)) {
              router.push(router.asPath.split("#")[0], router.asPath.split("#")[0], { locale: propsFn.newIso.toLowerCase() });
            }
            setAppCookies({
              language: propsFn.newIso
            })
        }
      },
      hasAlert: true,
    }),
    ...
  })
 * 
 */
export const sendAxiosPostRequest = (props: AxiosRequestProps) => {
    return axios.post(`${props.route}`, props.body || {}, props.header || {}).then((res: AxiosResponse) => {
        return myRequestHandler({
            t: props.t,
            response: res,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information,
            errorLogger: props.errorLogger
        });
    }).catch((error: AxiosError) => {
        const errorLogger = props.errorLogger;

        // ? Log the errors in BE - seperate them by use cases
        if (error && (error.response && error.response.status !== 200)) {
            sendErrorLogHttp({
                errorLogger: errorLogger,
                response: error,
                route: props.route,
                httpStatus: error.response && error.response.status ? error.response.status : undefined,
                id: "sendAxiosPostRequest-sendErrorLogHttp-catch"
            });
            // We need to show the client error logs for debugging - it didnt happen in myRequestHandler beceause it was throwing an error
            doMyResponseClientLogs({
                t: props.t,
                response: error,
                information: props.information,
            });
        } else if (error && error.code) {
            sendErrorLogNetwork({
                errorLogger,
                response: error,
                route: props.route
            });
        } else {
            sendErrorLogHandler({
                errorLogger: errorLogger,
                response: error,
                route: props.route,
                onResponse: props.onResponse,
                transformResponseData: props.transformResponseData,
                id: "sendAxiosPostRequest-sendErrorLogHandler-catch"
            });
        }
        console.error(error);
        // ? Throw error so server state isError is true;
        throw Error("Something went wrong ⬆️")
    })
}

/**
 * 
 * Customise everything you want to change to the handler behaviour below
 * 
 */

const project = process.env.ProjectName || "My project";
const getSimpleApiRoute = (route: string) =>
    route.replace(process.env.UriApi, "");

const replaceCallbackString = (text: string): string => text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\s+/g, ' ');

/**
 * 
 * The request handler that handles all axios requests - debug logs, alerts, error loggings, call data handlers etc
 * 
 */
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
        errorLogger,
        information
    } = props;
    var route = !response ? "NO RESPONSE" : !response.request ? "NO REQUEST" : response.request.responseURL; // API request route
    var status = response.request ? response.request.status : response.status; // HTTP status

    var apiStatus: number | null | undefined = isAxiosError(response) ? (((response.response?.data as MyApiRespone) && (response.response?.data as MyApiRespone).condition) || response.response?.status) : ((response.data && response.data.condition) || response.status || undefined);

    // ! Handle error conditional
    // if (!props.response || status !== 200 || isAxiosError(props.response) || apiStatus !== 200) {
    if (!props.response || status !== 200 || isAxiosError(props.response) || !apiStatus || (apiStatus && parseInt(apiStatus.toString()) > 299)) {
        try {
            // ? Debug logger
            handleDebugLogsAndAlerts({
                t,
                status,
                route,
                response,
                information,
                hideDebugLogs: hideDebugLogs || false,
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
                transformResponseData: transformResponseData,
                onResponse: onResponse,
                hideDebugLogs: true,
            });

            if (errorLogger && (errorLogger.doLogHttpErrors === undefined || errorLogger.doLogHttpErrors === true) && !errorLogger.props.mutateClientErrorLogger.isSuccess && status !== 200) {
                sendErrorLogHttp({
                    errorLogger,
                    response,
                    route,
                    httpStatus: status
                })
            } else if (errorLogger && (errorLogger.doLogHandlerErrors === undefined || errorLogger.doLogHandlerErrors === true) && !errorLogger.props.mutateClientErrorLogger.isSuccess && apiStatus && parseInt(apiStatus.toString()) > 299) {
                sendErrorLogApiStatus({
                    errorLogger,
                    response,
                    route,
                    apiStatus: apiStatus,
                    httpStatus: status
                })
            }

            return null;
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
                transformResponseData: transformResponseData,
                onResponse: onResponse,
                hideDebugLogs: props.hideDebugLogs === true && props.hideDebugLogs !== undefined ? true : false,
                information
            });

            // ? Throw something in onResponse to catch specific cases or API statuses
            if (onResponse) {
                onResponse(response);
            }
            // !? Return transformResponseData function so you can manipulate the data received and use it when the API status is 200
            return !apiStatus || apiStatus !== 200 ? null : transformResponseData ? transformResponseData(response as AxiosResponse) : !(response as AxiosResponse) && !(response as AxiosResponse).data.data ? null : (response as AxiosResponse).data.data === "No Data" ? null : (response as AxiosResponse).data.data;

        } catch (error) {
            if (error) {
                throw new Error(`Caught - Something went wrong - \n${error}`);
            } else {
                throw new Error(`Caught - Something went wrong ⬆️`);
            }
        }
    }
}

/**
 * 
 * Saves debug object in BE logs, so we can debug it. The error will be identified as a HTTP response error.
 * 
 */
const sendErrorLogHttp = (props: SendErrorLogType) => {
    const { response, route, errorLogger, id } = props;

    if (errorLogger && (errorLogger.doLogHttpErrors === undefined || errorLogger.doLogHttpErrors === true) && !errorLogger.props.mutateClientErrorLogger.isSuccess) {
        return saveErrorInLogs({
            id: id || "myRequestHandler-sendErrorLogHttp",
            severity: "MEDIUM",
            information: "Something went wrong in the request - Expected 200 HTTP status but got something different",
            mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
            res: errorLogger.isSecurityBreach ? null : response,
            router: errorLogger.props.router,
            userStore: errorLogger.props.userStore,
            details: { route, httpStatus: props.httpStatus || null, isSecurityBreach: errorLogger.isSecurityBreach },
            error: response.toString()
        })
    }
}

/**
 * 
 * Saves debug object in BE logs, so we can debug it. The error will be identified as a network error.
 * 
 */
const sendErrorLogNetwork = (props: SendErrorLogType) => {
    const { response, route, errorLogger, id } = props;

    if (errorLogger && (errorLogger.doLogNetworkErrors === undefined || errorLogger.doLogNetworkErrors === true) && !errorLogger.props.mutateClientErrorLogger.isSuccess) {
        return saveErrorInLogs({
            id: id || "myRequestHandler-sendErrorLogNetwork",
            severity: "HIGH",
            information: "Something went wrong in the request - Got a network error",
            mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
            res: errorLogger.isSecurityBreach ? null : response,
            router: errorLogger.props.router,
            userStore: errorLogger.props.userStore,
            details: { route, isSecurityBreach: errorLogger.isSecurityBreach },
            error: response.toString()
        })
    }
}

/**
 * 
 * Saves debug object in BE logs, so we can debug it. The error will be identified as a API call error.
 * 
 */
const sendErrorLogApiStatus = (props: SendErrorLogType) => {
    const { response, route, errorLogger, id } = props;

    if (errorLogger && (errorLogger.doLogApiErrors === undefined || errorLogger.doLogApiErrors === true) && !errorLogger.props.mutateClientErrorLogger.isSuccess) {
        return saveErrorInLogs({
            id: id || "myRequestHandler-sendErrorLogApiStatus",
            severity: "LOW",
            information: "Something went wrong in the request - Expected > 299 API status but got something different",
            mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
            res: errorLogger.isSecurityBreach ? null : response,
            router: errorLogger.props.router,
            userStore: errorLogger.props.userStore,
            details: { route, apiStatus: props.apiStatus || null, httpStatus: props.httpStatus || null, isSecurityBreach: errorLogger.isSecurityBreach }
        })
    }
}

/**
 * 
 * Saves debug object in BE logs, so we can debug it. The error will be identified as a calllback (onResponse, transformResponseData) error.
 * 
 */
const sendErrorLogHandler = (props: SendErrorLogType) => {
    const { response, route, errorLogger, id } = props;
    if (errorLogger && (errorLogger.doLogHandlerErrors === undefined || errorLogger.doLogHandlerErrors === true) && !errorLogger.props.mutateClientErrorLogger.isSuccess) {
        return saveErrorInLogs({
            id: id || "sendAxiosGetRequest-sendErrorLogHandler",
            severity: "HIGH",
            information: "Something went wrong trying to do myRequestHandler. Likely because something went wrong in any of the callbacks (transformResponseData or onResponse). Check the details (error) for more information.",
            mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
            res: "Error-callbacks",
            isMail: true,
            router: errorLogger.props.router,
            userStore: errorLogger.props.userStore,
            details: {
                apiRoute: route,
                onResponse: props.onResponse ? replaceCallbackString(props.onResponse.toString()) : null,
                transformResponseData: props.transformResponseData ? replaceCallbackString(props.transformResponseData.toString()) : null
            },
            error: response.toString()
        })
    }
}

/**
 * 
 * Handles debug logs and alerts according to the response, creates a handy object to debug with
 * 
 */
export function handleDebugLogsAndAlerts(props: HandleDebugLogsAndAlertsProps) {
    try {
        // ? (console) Debug-logs toggler for request handle
        const showDebugLogs: boolean =
            typeof envir.Variables.DisableConsole === "boolean"
                ? envir.Variables.DisableConsole!
                : envir.Variables.DisableConsole === "true" ? false : true;
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
            information,
            errorLogger
        } = props;

        var apiResponse = !isAxiosError(response) ? response?.data : (response?.response?.data);
        var apiStatus = isAxiosError(response)
            ? ((response.response?.data as MyApiRespone).condition || response.response?.status)
            : ((response.data as MyApiRespone).condition || response.status || null);
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
                hideDebugLogs,
                submitMessage,
                errorLogger
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
                } else if ((apiStatus && apiStatus > 299) && hasAlert) {
                    toast.error(errorSomething);
                }
                if (apiStatus === 200) {
                    methodLog = transformResponseData ? 'transformResponseData (found)' : 'transformResponseData (NOT FOUND)';
                    debugObject.log = methodLog;
                } else {
                    methodLog = transformResponseData ? 'transformResponseData (found) did not trigger because API status was not 200' : "Api status was not 200"
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
        debugObject.log = `${debugObject.log} & ${onResponse ? 'onResponse (found)' : 'onResponse (NOT FOUND)'}`


        const apiRoute = getSimpleApiRoute(route);
        const log = debugObject.log;
        delete debugObject.log;
        if (information) debugObject["🔍 information"] = information
        debugObject["🛠️ settings"].log = log;

        // Send alert to frontend developer so they can send the given json to the appropriate developer with ease :)
        if (process.env.ConfigState === CONFIG_STATE.LOCAL && (status !== 200 || (apiStatus && apiStatus > 299))) {
            prompt(`🐛 You found a bug! \n\n ${apiRoute} \n HTTP: ${status}  API: ${apiStatus} \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`, JSON.stringify(debugObject, null, 2));
        }
        if (!hideDebugLogs && showDebugLogs === true) {
            const generalMessage = status === 200 && (apiStatus && apiStatus <= 299) ? chalk.bold(`✅ ${status} (${apiStatus}):`) : chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`)
            console.log(
                generalMessage,
                apiRoute + '\n\n',
                debugObject
            );

        }
    } catch (error) {
        console.error(`Something went wrong in handleDebugLogsAndAlerts: ${error}`);
    }
}

/**
 * 
 * For some axios errors, the console logs dont show up from my debug-handler, this method will do that
 * 
 */
export function doMyResponseClientLogs(props: MyResponseClientLogs) {
    // Accepted parameters of this method
    // ? Debug logger
    const {
        t,
        response,
        information
    } = props;

    var route = !response ? null : !response.request ? null : response.request.responseURL; // API request route
    var status = response.request ? response.request.status : response.status; // HTTP status
    handleDebugLogsAndAlerts({
        t,
        status,
        route,
        response,
        information
        // ? Dont give hasAlert & isSubmit - we dont want to show alerts yet - because the call can expect custom ones in onResponse
    });
}

/**
 * 
 * Types and interfaces for the request handlers
 * 
 */

export type AxiosCombinedResponse = AxiosResponse<MyApiRespone>;

interface HandleDebugLogsAndAlertsProps extends RequestHandlerProps {
    status: number;
    route: string;
}

interface RequestHandlerProps {
    response: AxiosError | AxiosCombinedResponse;
    t: (key: string) => void;
    isSubmit?: boolean;
    hasAlert?: boolean;
    hasAlertError?: boolean;
    hideDebugLogs?: boolean;
    submitMessage?: string;
    errorLogger?: {
        doLogHttpErrors?: boolean; // default = true
        doLogHandlerErrors?: boolean; // default = true
        doLogNetworkErrors?: boolean; // default = true
        doLogApiErrors?: boolean; // default = true
        isSecurityBreach?: boolean; // default = false || if you dont want the logs to contain response (so that it doesnt include body) 
        props: Omit<HttpErrorLoggerProps, "id" | "details" | "origin" | "res" | "information" | "severity">;
    };
    onResponse?: (res: AxiosError | AxiosCombinedResponse) => void;
    transformResponseData?: (res: AxiosCombinedResponse) => Array<any> | { [key: string]: any } | null; // ! If you use this, you'll need to return something, else you might get a react-query error!
    information?: { [key: string]: any }; // Log extra client states for more information
}

interface AxiosRequestProps extends Omit<RequestHandlerProps, "response"> {
    header?: { [key: string]: any };
    route: string;
    body?: { [key: string]: any };
}

type SendErrorLogType = {
    id?: string;
    response: AxiosCombinedResponse | AxiosError | AxiosResponse;
    route: string;
    apiStatus?: number;
    httpStatus?: number;
    errorLogger: RequestHandlerProps["errorLogger"];
    transformResponseData?: RequestHandlerProps["transformResponseData"];
    onResponse?: RequestHandlerProps["onResponse"];
}

type MyResponseClientLogs = {
    response: AxiosError
    t: RequestHandlerProps["t"]
    information: RequestHandlerProps["information"];
}

export interface MyApiRespone {
    data: any;
    condition: number;
    details: string | null;
    isDataCompressed: boolean;
    reflection: any;
}