import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import chalk from "chalk";
import { toast } from "react-toastify";
import envir from "@/env.json";
import { HttpErrorLoggerProps, saveErrorInLogs } from "./requestErrorLogger";

/**
 * 
 * ############################################################################
 *  
 * These are handlers for http/api requests and is used things like:
 * - debug logs 
 * - general alert handling 
 * - returned data handling 
 * - api status handlinga
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
 * @param onResponse - Do something when you get any response (AxiosResponse | AxiosError)
 * @param transformResponseData - Manipulate returned data
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
            information: props.information,
            errorLogger: props.errorLogger
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
            information: props.information,
            errorLogger: props.errorLogger
        });
        console.error(error);
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
 * @param onResponse - Do something when you get any response (AxiosResponse | AxiosError)
 * @param transformResponseData - Manipulate returned data
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
 */
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
            information: props.information,
            errorLogger: props.errorLogger
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
            information: props.information,
            errorLogger: props.errorLogger
        });
        console.error(error);
        throw Error("Something went wrong ⬆️")
    })
}

/**
 * 
 * Customise everything you want to change to the handler behaviour below
 * 
 */

const project = "My Project Name";
const getSimpleApiRoute = (route: string) =>
    route.replace(envir.Variables.API, "");

export interface WiseApiResponse {
    data: any;
    condition: number;
    details: string | null;
    isDataCompressed: boolean;
    reflection: any;
}

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
    var apiStatus: number | null | undefined = isAxiosError(response) ? ((response.response?.data as WiseApiResponse).condition || response.response?.status) : ((response.data as WiseApiResponse).condition || response.status || undefined);

    // ! Handle error conditional
    if (!props.response || status !== 200 || isAxiosError(props.response) || apiStatus !== 200) {
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
                transformResponseData: transformResponseData,
                onResponse: onResponse,
                hideDebugLogs: true,
            });

            if (errorLogger && errorLogger.doLogHttpErrors && !errorLogger.props.mutateClientErrorLogger.isSuccess && status !== 200) {
                saveErrorInLogs({
                    id: "myRequestHandler-httpError",
                    severity: "HIGH",
                    origin: "myRequestHandler",
                    information: "Something went wrong in the request - Expected 200 HTTP status but got something different",
                    mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
                    res: errorLogger.isSecurityBreach ? null : response,
                    router: errorLogger.props.router,
                    userStore: errorLogger.props.userStore,
                    details: { route, status }
                })
            }

            return null;
        } catch (error) {
            if (errorLogger && errorLogger.doLogHandlerErrors && !errorLogger.props.mutateClientErrorLogger.isSuccess) {
                saveErrorInLogs({
                    id: "myRequestHandler-error",
                    severity: "HIGH",
                    origin: "myRequestHandler",
                    information: "Something went wrong in the myRequestHandler in the error conditional",
                    mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
                    res: errorLogger.isSecurityBreach ? null : response,
                    isMail: true,
                    router: errorLogger.props.router,
                    userStore: errorLogger.props.userStore,
                    details: { error, route, status, extra: "When this error is logged, its probably something wrong in the callbacks" }
                })
            }
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
            // !? Return transformResponseData function so you can manipulate the data received and use it
            return transformResponseData ? transformResponseData(response as AxiosResponse) : !(response as AxiosResponse) && !(response as AxiosResponse).data.data ? null : (response as AxiosResponse).data.data === "No Data" ? null : (response as AxiosResponse).data.data;

        } catch (error) {
            if (errorLogger && errorLogger.doLogHandlerErrors && !errorLogger.props.mutateClientErrorLogger.isSuccess) {
                saveErrorInLogs({
                    id: "myRequestHandler-success",
                    severity: "HIGH",
                    origin: "myRequestHandler",
                    information: "Something went wrong in the myRequestHandler in the success conditional",
                    mutateClientErrorLogger: errorLogger.props.mutateClientErrorLogger,
                    res: errorLogger.isSecurityBreach ? null : response,
                    isMail: true,
                    router: errorLogger.props.router,
                    userStore: errorLogger.props.userStore,
                    details: { error, route, status, extra: "When this error is logged, its probably something wrong in the callbacks" }
                })
            }
            if (error) {
                throw new Error(`Caught - Something went wrong - \n${error}`);
            } else {
                throw new Error(`Caught - Something went wrong ⬆️`);
            }
        }
    }
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
            information,
            errorLogger
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
        debugObject.log = `${debugObject.log} && ${onResponse ? 'onResponse (found)' : 'onResponse (NOT FOUND)'}`

        if (!hideDebugLogs && showDebugLogs) {
            const generalMessage = status === 200 && (apiStatus && apiStatus <= 299) ? chalk.bold(`✅ ${status} (${apiStatus}):`) : chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`)
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


/**
 * 
 * Types and interfaces for the request handlers
 * 
 */

export type AxiosCombinedResponse = AxiosResponse<WiseApiResponse>;

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
        doLogHttpErrors: boolean;
        doLogHandlerErrors: boolean;
        isSecurityBreach?: boolean; /* if you dont want the logs to contain response (so that it doesnt include body) */
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