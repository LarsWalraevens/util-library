import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import chalk from "chalk";
import { toast } from "react-toastify";
import { LOCAL_STORAGE } from "../data/enums";

const project = "My project";
const getSimpleApiRoute = (route: string) =>
    route.replace((process.env.NEXT_PUBLIC_UriApi as string) || "", "");

/**
 * 
 * ############################################################################
 *  
 * These are handlers for http/api requests and is used things like:
 * - data handling from calls (props: transformResponseData)
 * - api status handling (props: onResponse)
 * - debug logs 
 * - log errors to the database
 * - general alert handling 
 * - more...
 * 
 * Important note: This handler expects an API status in the response (currently the handler expects "condition" - search for it)
 * You can either edit this or remove it entirely
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
 * @param isSecurityBreach - Dont throw sensitive data in errors (thrown errors can be logged)
 * 
 * @example 
 * useQuery({
        queryFn: () => sendAxiosGetRequest({
        route: `v2/generic/catalogues/Languages`,
        t,
        errorLogger: {
            doLogHandlerErrors: true,
            doLogHttpErrors: true,
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
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the transformResponseData - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            t: props.t,
            response: res,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSecurityBreach: props.isSecurityBreach,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information,
            additionalTitleLog: props.additionalTitleLog
        });
    }).catch((error: AxiosError) => {
        // ? Log the errors in BE - seperate them by use cases
        if (error && (error.response && error.response.status !== 200)) {
            // We need to show the client error logs for debugging - it didnt happen in myRequestHandler beceause it was throwing an error
            doMyResponseClientLogs({
                t: props.t,
                response: error,
                information: props.information,
            });
        }
        console.error(error);
        // ? throw new Error so server state isError is true;
        throw (error);
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
 * @param isSecurityBreach - Dont throw sensitive data in errors (thrown errors can be logged)
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
        // ? Debug & request handler
        // ? If status is ok, it will return whatever is in the transformResponseData - make sure you return whatever you want so that it will be in the server state
        return myRequestHandler({
            t: props.t,
            response: res,
            transformResponseData: props.transformResponseData,
            onResponse: props.onResponse,
            hasAlert: props.hasAlert,
            submitMessage: props.submitMessage,
            isSecurityBreach: props.isSecurityBreach,
            isSubmit: props.isSubmit,
            hideDebugLogs: props.hideDebugLogs,
            information: props.information,
            additionalTitleLog: props.additionalTitleLog
        });
    }).catch((error: AxiosError) => {
        // ? Log the errors in BE - seperate them by use cases
        if (error && (error.response && error.response.status !== 200)) {
            // We need to show the client error logs for debugging - it didnt happen in myRequestHandler beceause it was throwing an error
            doMyResponseClientLogs({
                t: props.t,
                response: error,
                information: props.information,
            });
        }
        console.error(error);
        // ? throw new Error so server state isError is true;
        throw (error);
    })
}


/**
 * 
 * IMPORTANT POINT - Customise everything you want to change to the handler behaviour below
 * 
 */

/**
 * 
 * The request handler that handles all axios requests - debug logs, alerts, error loggings, call data handlers etc
 * 
 */
export function myRequestHandler(props: RequestHandlerProps) {
    try {
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
            information,
            additionalTitleLog,
            isSecurityBreach
        } = props;
        var route = !response ? "NO RESPONSE" : !response.request ? "NO REQUEST" : response.request.responseURL; // API request route
        var status = response.request ? response.request.status : response.status; // HTTP status

        var apiStatus: number | null | undefined = isAxiosError(response) ? (((response.response?.data as MyApiResponse) && (response.response?.data as MyApiResponse).condition) || response.response?.status) : ((response.data && response.data.condition) || response.status || undefined);

        // ! Handle error conditional
        if (!props.response || status !== 200 || isAxiosError(props.response) || !apiStatus || (apiStatus && parseInt(apiStatus.toString()) > 299)) {
            // ? Debug logger
            handleDebugLogsAndAlerts({
                t,
                status,
                route,
                response,
                information,
                hideDebugLogs: hideDebugLogs || false,
                additionalTitleLog
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
                isSecurityBreach,
            });

            // ? Throw an error with detailed stringified error so that error state is true & we error reason is the stringified error & could possibly log it to server
            throw JSON.stringify(getRequestErrorObject({
                response: response,
                isSecurityBreach: isSecurityBreach || false
            }), null, 2);
        }

        // ! Handle success conditional
        // ? Will trigger if its 200 HTTP status and has expected props
        else {
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
                information,
                additionalTitleLog,
                isSecurityBreach,
            });

            // ? Throw something in onResponse to catch specific cases or API statuses
            if (onResponse) {
                onResponse(response);
            }
            // !? Return transformResponseData function so you can manipulate the data received and use it when the API status is 200
            return !apiStatus || apiStatus !== 200 ? null : transformResponseData ? transformResponseData(response as AxiosResponse) : !(response as AxiosResponse) && !(response as AxiosResponse).data.data ? null : (response as AxiosResponse).data.data === "No Data" ? null : (response as AxiosResponse).data.data;
        }
    } catch (error) {
        throw (error as any).toString()
    }
}

/**
 * 
 * Handles debug logs and alerts according to the response, creates a handy object to debug with
 * 
 */
export function handleDebugLogsAndAlerts(props: HandleDebugLogsAndAlertsProps) {
    // ? (console) Debug-logs toggler for request handle
    const showDebugLogs: boolean =
        typeof window !== "undefined" && localStorage.getItem(LOCAL_STORAGE.SHOW_DEBUG_LOGS) && localStorage.getItem(LOCAL_STORAGE.SHOW_DEBUG_LOGS) === "true" ? true :
            typeof process.env.NEXT_PUBLIC_DisableConsole === "boolean"
                ? process.env.NEXT_PUBLIC_DisableConsole!
                : process.env.NEXT_PUBLIC_DisableConsole === "true" ? false : true;
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
        additionalTitleLog
    } = props;

    var apiResponse = !isAxiosError(response) ? response?.data : (response?.response?.data);
    var apiStatus = isAxiosError(response)
        ? ((response.response?.data as MyApiResponse).condition || response.response?.status)
        : ((response.data as MyApiResponse).condition || response.status || null);
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

    if (!hideDebugLogs && showDebugLogs === true) {
        const generalMessage = status === 200 && (apiStatus && apiStatus <= 299) ? chalk.bold(`✅ ${status} (${apiStatus}):`) : chalk.bold(`🛑 ${status} (${apiStatus || "Unknown"}):`)
        console.log(
            generalMessage,
            apiRoute + '\n\n',
            additionalTitleLog ? `${additionalTitleLog} \n\n` : "",
            debugObject
        );
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
 * Used object for when error is thrown - for more information about the error & reason
 * 
 */
export function getRequestErrorObject(props: {
    response: AxiosError | AxiosCombinedResponse;
    reason?: string;
    isSecurityBreach?: boolean;
}): RequestErrorObject {
    const res = props.response;
    const httpStatus = res.request && res.request.status ? res.request.status : res.status; // HTTP status
    const method = res.config ? res.config.method : "Not found";
    const route = res.request && res.request.responseURL ? res.request.responseURL : (res.config?.url || "Not found");
    const body = method && method.toUpperCase() !== "POST" ? null : res.request && res.request.data ? res.request.data : (res.config?.data || {});
    const apiStatus: number | null = !isAxiosError(res) && res.data ? res.data.condition && res.data.condition : (res.status || null);

    return {
        reason: props.reason ? props.reason :
            (
                apiStatus && apiStatus > 299
            ) ? "Something went wrong in the request - Expected > 299 API status but got something different" : "Unknown",
        apiStatus: apiStatus || null,
        httpStatus,
        response: {
            method,
            route,
            body: props.isSecurityBreach ? "SECURITY BREACH" : body,
            apiStatus
        }
    }
}

/**
 * 
 * Types and interfaces for the request handlers
 * 
 */

export type AxiosCombinedResponse = AxiosResponse<MyApiResponse>;

export interface RequestErrorObject {
    reason: string;
    apiStatus: number | null;
    httpStatus: number | null;
    response: any | null
}

interface HandleDebugLogsAndAlertsProps extends RequestHandlerProps {
    status: number;
    route: string;
}

interface RequestHandlerProps {
    response: AxiosError | AxiosCombinedResponse;
    t: (key: string) => void;
    isSubmit?: boolean;
    isSecurityBreach?: boolean;
    hasAlert?: boolean;
    hasAlertError?: boolean;
    hideDebugLogs?: boolean;
    additionalTitleLog?: string;
    submitMessage?: string;
    onResponse?: (res: AxiosError | AxiosCombinedResponse) => void;
    transformResponseData?: (res: AxiosCombinedResponse) => Array<any> | { [key: string]: any } | null; // ! If you use this, you'll need to return something, else you might get a react-query error!
    information?: { [key: string]: any }; // Log extra client states for more information
}

export interface AxiosRequestProps extends Omit<RequestHandlerProps, "response"> {
    header?: { [key: string]: any };
    route: string;
    body?: { [key: string]: any };
}

type MyResponseClientLogs = {
    response: AxiosError
    t: RequestHandlerProps["t"]
    information: RequestHandlerProps["information"];
}

export interface MyApiResponse {
    data: any;
    condition: number;
    details: string | null;
    isDataCompressed: boolean;
    reflection: any;
}