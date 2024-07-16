import { UseMutationResult, UseQueryResult, useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CONFIG_STATE, DATE_FORMAT, ENVARIABLE } from "../data/enums";
import { UserStore, useUserStore } from "../store/userStore";
import { AxiosCombinedResponse, sendAxiosPostRequest, MyApiResponse } from "./request-handler";
import { useAtom } from "jotai";
import { prevRoutesAtom } from "@/components/layouts/app/app-wrapper";
import { printLog } from "./my-methods";


/**
 * 
 * ############################################################################
 * 
 * The following methods are used catch client errors and store them in a database 
 * with a detailed debug object
 * 
 * And more, find more details at the methods
 * 
 * ############################################################################
 */


/** 
 * 
 * Call that registers an (frontend) client log in database
 * 
 * @param id Give an <string> id to the function so that we can identify this specific item to make it easier to debug and that we can fix the error
 * @param doNotAlertTester Do not alert tester with debug object
 * @returns Mutation to insert logs (frontend errors) in database
 * 
 */
export const useClientErrorLogger = (props: {
    id: string;
    doNotAlertTester?: boolean;
    severity?: "info" | "warn" | "error";
}): any => {
    const { t } = useTranslation();
    const [isAlerted, setIsAlerted] = useState<boolean>(false);
    const [prevRoutes] = useAtom(prevRoutesAtom);
    const { id, doNotAlertTester, severity } = props;
    const handleSeverity = (severity: "info" | "warn" | "error") => {
        switch (severity) {
            case "info":
                return 2;
            case "warn":
                return 3;
            case "error":
                return 4;
            default: return 4;
        }
    }

    return useMutation({
        mutationKey: [id ? `mutateErrorLog-${id}` : `mutateErrorLog`],
        mutationFn: (props: ReturnType<typeof getDebugObject>) => {
            const myProps: ReturnType<typeof getDebugObject> = { ...props };
            myProps["🐛 id"] = id;
            if (myProps["🔍 details"] && !myProps["🔍 details"].prevRoutes) myProps["🔍 details"].prevRoutes = prevRoutes;

            return sendAxiosPostRequest({
                route: `vx/insert/logs/client`,
                t,
                body: {
                    Log: { ...myProps },
                    isMail: process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.LOCAL ? false : (props.isMail || false),
                    Severity: handleSeverity(severity || "error"),
                },
                onResponse: (res) => {
                    if (!isAxiosError(res)) {
                        if (!isAlerted && (doNotAlertTester === undefined || doNotAlertTester === false) && (severity === "error" || !severity)) console.log(`%c⚠️ Your error has been logged. Please let us know more when you can at ${ENVARIABLE.CONTACTEMAIL} or ${ENVARIABLE.CONTACTPHONE}`, "font-weight: bold; font-size: 22px; color:red;")
                        // Let tester / developer know something went wrong in browser alert
                        if (!isAlerted && (doNotAlertTester === undefined || doNotAlertTester === false)) {
                            setIsAlerted(true);
                            setTimeout(() => {
                                sendPromptAlertToTester({
                                    Id: id || "Unset",
                                    Log: { ...props },
                                    isMail: props.isMail || false
                                })
                            }, 1);
                        }
                    }
                }
            })
        },
        retry: false,
        cacheTime: 0,

    })
}

/**
 * 
 * Catch and register a request error in backend logs, this logic makes it so it only is registered once instead of every time it is retried.
 * Important to note that this is build on @tanstack/react-query - we need the status amongst other things for this hook to work.
 * 
 * @prop status - Status of the query
 * @prop logRetries - If you want to log a retry, pass in an object with failureCount and failureReason
 * @prop debugProps - The props that you want to pass to the debug object
 * 
 */
export const useCatchRequestErrorAndCreateLog = (props: {
    status: "error" | string;
    logRetries?: {
        failureCount: number;
        failureReason: string;
    };
    debugProps: Omit<GetDebugObjectProps, 'information'> & Partial<Pick<GetDebugObjectProps, 'information'>>
}) => {
    const myDebugObjectProps = props.debugProps;
    const allowEnvRetry: boolean = process.env.NEXT_PUBLIC_ConfigState !== CONFIG_STATE.LOCAL;
    const allowShowDevHttpAlert: boolean = process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.LOCAL;
    // ! ONLY USED FOR TESTING - DONT FORGET TO SWITCH  (above should NOT be commented)
    // const allowEnvRetry: boolean = true;
    // const allowShowDevHttpAlert: boolean = false;

    const mutateClientErrorLogger = useClientErrorLogger({
        id: myDebugObjectProps.id,
        severity: "error"
    });
    const mutateClientLoggerSuccessAfterRetry = useClientErrorLogger({
        id: `successAfterRetry - ${myDebugObjectProps.id}`,
        doNotAlertTester: true,
        severity: "warn"
    });

    const router = useRouter();
    const userStore = useUserStore();
    const [prevRoutes, _] = useAtom(prevRoutesAtom);
    const [failureCount, setFailureCount] = useState(props.logRetries?.failureCount || 0);
    const [retryDataItems, setRetryDataItems] = useState<RetryDataProps[]>([]);

    // ? Trigger retry change
    useEffect(() => {
        if (props.logRetries && props.logRetries.failureCount !== failureCount) setFailureCount(props.logRetries.failureCount)
    }, [...(props.logRetries ? [props.logRetries.failureCount] : [])]);

    // ? Catch retry count & do mutation
    useEffect(() => {
        if (allowEnvRetry && props.logRetries && props.logRetries.failureCount > 0 && props.status === "loading" && props.logRetries.failureCount !== failureCount &&
            retryDataItems.find((item) => item && item.retryNumber === props.logRetries!.failureCount) === undefined
        ) {
            const retryData: RetryDataProps = {
                failureReason: props.logRetries.failureReason,
                retryNumber: props.logRetries.failureCount,
                information: `${props.logRetries.failureCount}${props.logRetries.failureCount > 1 ? "th" : "st"} retry of a call via react-query: ${props.debugProps.information || "Something went wrong. Please check the details (error) for more information."}`
            };
            setRetryDataItems([...retryDataItems, retryData]);
        }
    }, [[...(props.logRetries ? [failureCount] : [])]])

    // ? Trigger on status change (error) & do mutation
    return useEffect(() => {
        if (!mutateClientErrorLogger.isSuccess && props.status === "error") {
            var debugObjectProps = { ...myDebugObjectProps };
            if (debugObjectProps.information) debugObjectProps.information = props.debugProps.information || "Something went wrong. Please check the details (error) for more information."
            const debugObject = getDebugObject({
                ...debugObjectProps as GetDebugObjectProps,
                router,
                userStore,
                prevRoutes,
                details: props.logRetries && retryDataItems ? { retriesData: retryDataItems } : undefined
            });

            // Dont log errors in backend when developing - send alert to developer instead
            if (allowShowDevHttpAlert && debugObject["🚨 error"]) {
                var response: AxiosResponse | AxiosError;
                try {
                    // At some point its a parsed string into a jsonified string loop (idk how lol)... so convert
                    if (typeof JSON.parse(debugObject["🚨 error"]) === "object") {
                        response = JSON.parse(debugObject["🚨 error"]);
                    } else if (typeof JSON.parse(JSON.parse(debugObject["🚨 error"])) === "object") {
                        response = JSON.parse(JSON.parse(debugObject["🚨 error"]));
                    } else if (typeof JSON.parse(JSON.parse(JSON.parse(debugObject["🚨 error"]))) === "object") {
                        response = JSON.parse(JSON.parse(JSON.parse(debugObject["🚨 error"])));
                    } else {
                        // give up
                        response = debugObject["🚨 error"] as any;
                    }
                } catch (error) {
                    response = debugObject["🚨 error"] as any;
                }
                // Only send alert if response is an axios error or MYAPI response
                if (
                    isAxiosError(response) ||
                    (response && response.data && response.request !== undefined) ||
                    (response && response.status)
                ) {
                    const backendDebugObj = getRequestAndResponseObject(response);

                    const httpStatus = response.request && response.request.status ? response.request.status : response.status; // HTTP status
                    var apiStatus: number | null | undefined = isAxiosError(response) ? (((response.response?.data as MyApiResponse) && (response.response?.data as MyApiResponse).condition) || response.response?.status) : ((response.data && response.data.condition) || response.status || undefined);
                    var apiRoute = response.config && response.config.url ? response.config.url : response.request.responseURL; // API request route

                    // Send alert to frontend developer so they can send the given json to the backend developer with ease :)
                    if ((httpStatus !== 200 || (apiStatus && apiStatus > 299))) {
                        prompt(`🐛 You found a possible backend bug! \n\n ${apiRoute} \n HTTP: ${httpStatus}  API: ${apiStatus} \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`, JSON.stringify(backendDebugObj, null, 2));
                    }

                } else {
                    printLog({ reason: "Unknown - not considered a bug?", debugObject, response });
                }

            }
            else mutateClientErrorLogger.mutate(debugObject);
        }
        // Retry logger (optional - if we got correct props)
        if (props.status === "success" && props.logRetries && retryDataItems.length > 0 && !mutateClientLoggerSuccessAfterRetry.isSuccess) {
            var debugObjectProps = { ...myDebugObjectProps };
            if (debugObjectProps.information) debugObjectProps.information = "Call was retried successfully but after atleast one failure. Please check the details (retriesData) for more information."
            const debugObject = getDebugObject({
                ...debugObjectProps as GetDebugObjectProps,
                router,
                userStore,
                prevRoutes,
                details: props.logRetries && retryDataItems ? { retriesData: retryDataItems } : undefined
            });

            debugObject["🚨 error"] = "NO ERROR - retry was a success";
            mutateClientLoggerSuccessAfterRetry.mutate(debugObject)
        }
    }, [props.status])
}

/**
 * 
 * Creates an organised debug object for requests errors, mostly used for the custom hook useCatchRequestErrorAndCreateLog
 * 
 * @prop query - Should give the query variable so that the error can be logged with great detail
 * 
 */
export const getDefaultRequestDebugObject = (props: {
    id: string; // usually the custom hook or queryKey/mutationKey
    information?: string;
    query?: UseQueryResult<any, unknown> | UseMutationResult<any, any, any>
    details?: GetDebugObjectProps["details"]
}): GetDebugObjectProps => {
    const myQuery = props.query || null;
    const defaultInformationMessage = "Something went wrong while trying to do a HTTP request. Please check the details (error) for more information.";

    return {
        id: `CALL - ${props.id || "unknown"}`,
        error: myQuery && myQuery.error ? typeof myQuery.error !== "string" ? JSON.stringify(myQuery.error) : myQuery.error : "Not found...",
        // ? Dynamically choose detailed information about the error
        information: myQuery && myQuery.error && !isAxiosError(myQuery?.error) && (myQuery.error as AxiosCombinedResponse).status && (myQuery.error as AxiosCombinedResponse).status !== 200 ? "Something went wrong in the request - Expected 200 HTTP status but got something different" :
            myQuery && myQuery.error && myQuery?.error.response && myQuery?.error.response.data && myQuery?.error.response.data.condition && myQuery?.error.response.data.condition <= 299 ? "Something went wrong in the request - Expected > 299 API status but got something different" :
                myQuery && myQuery?.error && myQuery?.error.data && myQuery?.error.data.condition && myQuery?.error.data.condition > 299 ? "Something went wrong in the request - Expected > 299 API status but got something different" :
                    props.information ? props.information :
                        defaultInformationMessage,
        caughtAt: "useEffect from useCatchRequestErrorAndCreateLog with id: " + props.id,
        details: {
            ...props.details,
            retries: myQuery ? myQuery.failureCount : "No query data (failureCount) found...",
            data: myQuery ? myQuery.data : "No query data (data) found..."
        }
    }
}

/**
 * 
 * Creates a simple request and response object - mostly used to send to backend dev
 * 
 * @prop res - Axios response
 * 
 */

export const getRequestAndResponseObject = (res: AxiosError | AxiosCombinedResponse) => {
    const method = res.request ? res.request.method : (res.config?.method || "Not found");
    const route = res.request && res.request.responseURL ? res.request.responseURL : (res.config?.url || "Not found");
    const body = method && method.toUpperCase() !== "POST" ? null : res.request && res.request.data ? res.request.data : (res.config?.data || {});
    const httpStatus = res.request && res.request.status ? res.request.status : res.status; // HTTP status

    const apiStatus = !isAxiosError(res) && res.data ? res.data.condition && res.data.condition : (res.status || "Not found");
    const apiResponse = !isAxiosError(res) && res.data ? res.data.data !== undefined ? res.data.data : res.data : "Not found";

    return {
        ["📡 request"]: {
            method,
            route,
            body: body ? JSON.parse(body) : "Not found",
        },
        ["📩 response"]: {
            httpStatus: httpStatus,
            // httpResponse: response, // If you want to see the whole RAW response
            apiStatus,
            apiResponse,
        },
    }
}

/**
 * 
 * Creates an organised debug object
 * 
 * @param props
 * @returns Debug object
 * 
 */
export const getDebugObject = (props: GetDebugObjectProps) => {
    const error = props.error && typeof props.error === "object" && JSON.stringify(props.error) ? JSON.stringify(props.error) : props.error;

    return {
        isMail: props.isMail || false, /* needs to stay here */
        ["🐛 id"]: props.id,
        ["💬 information"]: props.information,
        ["📌 location"]: {
            project: "My project",
            env: process.env.NEXT_PUBLIC_ConfigState || null,
            caughtAt: props.caughtAt || props.id,
            route: !props.router ? null : props.router.asPath,
            routerLang: props.router ? props.router.locale : null,
        },
        ["🚨 error"]: typeof error === "string" ? error : props.error,
        ["🔍 details"]: {
            ...(props.details || null),
            time: dayjs().format(DATE_FORMAT.DAY_MONTH_YEAR_TIME),
            loggedIn: props.userStore?.userData?.loggedIn || false,
            response: props.res === "Error-callbacks" ? "No response (Error-callbacks): Something went wrong in the callbacks, check the error in details" : (props.res || null),
            prevRoutes: props.prevRoutes || [],
            docReferrer: typeof document === "undefined" ? null : document.referrer || null,
            ["999.userData"]: props.userStore ? props.userStore.userData : null,
        },
    }
}

/**
 * 
 * Saves debug object in logs so we can debug it - used error catches in complex functions
 * 
 * @param props 
 * 
 */
export const saveErrorInLogs = (props: HttpErrorLoggerProps) => {
    if (props.mutateClientErrorLogger.isSuccess) return
    else if (props.res) {
        const debugObj = getDebugObject({
            isMail: props.isMail,
            id: props.id,
            information: props.information,
            router: props.router,
            userStore: props.userStore,
            details: props.details,
            res: props.res,
            error: props.error || undefined
        })
        return props.mutateClientErrorLogger.mutate({
            ...debugObj
        });
    }
}


/**
 * 
 * Sends a browser alert to the tester (ONLY IF config state is development, test) so they can send the given json to the appropriate developer
 * 
 * @param json - JSON debug object (preferably from getDebugObject)
 * @returns Browser alert 
 * 
 */
export function sendPromptAlertToTester(json: {
    Id: string;
    Log: ReturnType<typeof getDebugObject>;
    isMail: boolean;
} | ReturnType<typeof getDebugObject>) {
    if (
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.LOCAL ||
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.DEVELOPMENT ||
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.TEST
    ) {
        const tempJson: ReturnType<typeof getDebugObject> = typeof json === "object" && "Log" in json
            ? {
                ...json.Log,
                '🐛 id': json.Id,
            }
            : {
                ...json,
                '🐛 id': (json as { [key: string]: any })['🐛 id'],
            }

        if (tempJson['🔍 details'] && tempJson['🔍 details']["999.userData"]) (tempJson['🔍 details']["999.userData"] as any) = "Check back-office logs";
        if (tempJson['🔍 details'] && tempJson['🔍 details'].response) tempJson['🔍 details'].response = "Check back-office logs";
        return prompt(
            `🐛 You found a bug! \n\n ID: ${tempJson['🐛 id']} \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`,
            JSON.stringify(tempJson, null, 2)
        );
    }
}
export type HttpErrorLoggerProps = {
    id: string;
    information: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    res?: AxiosResponse | AxiosError | "Error-callbacks" | null; // Error-callbacks means that something went wrong in the handlers where the hook used a callback and has something wrong in it
    error?: string;
    router: NextRouter;
    userStore: UserStore;
    mutateClientErrorLogger: UseMutationResult<any, any, any>;
    isMail?: boolean;
    details?: { [key: string]: any };
}

export interface GetDebugObjectProps {
    isMail?: boolean;
    id: string;
    information: string;
    caughtAt?: string;
    router?: NextRouter;
    userStore?: UserStore;
    details?: { [key: string]: any };
    res?: HttpErrorLoggerProps["res"];
    error?: string;
    prevRoutes?: string[];
}

export interface RetryDataProps {
    information: string;
    retryNumber: number;
    failureReason: string;
}