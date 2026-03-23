import { cookiesUserAtom } from '@/components/layouts/app/app-provider'
import { CookiesUser } from '@/lib/types/generic'
import {
    useMutation,
    UseMutationResult,
    UseQueryResult,
} from '@tanstack/react-query'
import { AxiosError, AxiosResponse, isAxiosError } from 'axios'
import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CONFIG_STATE, DATE_FORMAT } from '../helpers/enums'
import { UserData, UserStore, useUserStore } from '../hooks/userStore'
import { printLog, printTriggerAndExpectedBehaviour } from './my-methods'
import {
    AxiosCombinedResponse,
    RequestErrorObject,
    sendAxiosPostRequest,
    WiseApiResponse,
} from './my-request-handler'

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
    id: string
    doNotAlertTester?: boolean
    severity?: 'info' | 'warn' | 'error'
}) => {
    const [isAlerted, setIsAlerted] = useState<boolean>(false)
    const { id, doNotAlertTester, severity } = props

    return useMutation({
        mutationKey: [id ? `mutateErrorLog-${id}` : `mutateErrorLog`],
        mutationFn: (props: ReturnType<typeof getDebugObject>) => {
            const myProps: ReturnType<typeof getDebugObject> = { ...props }
            myProps['🐛 id'] = id

            return sendAxiosPostRequest({
                route: `${process.env.NEXT_PUBLIC_UriOfficeApi}v1/insert/logs/client`,
                body: {
                    Message: { ...myProps },
                    isMail:
                        process.env.NEXT_PUBLIC_ConfigState ===
                        CONFIG_STATE.LOCAL
                            ? false
                            : props.isMail || false,
                    Severity: severity || 'error',
                },
                onResponse: (res) => {
                    if (!isAxiosError(res)) {
                        if (
                            !isAlerted &&
                            (doNotAlertTester === undefined ||
                                doNotAlertTester === false) &&
                            (severity === 'error' || !severity)
                        )
                            console.log(
                                `%c⚠️ Your error has been logged. Please let us know more when you can at ${process.env.NEXT_PUBLIC_CONTACT_EMAIL as string} or ${process.env.NEXT_PUBLIC_CONTACT_PHONE as string}`,
                                'font-weight: bold; font-size: 22px; color:red;',
                            )
                        // Let tester / developer know something went wrong in browser alert
                        if (
                            !isAlerted &&
                            (doNotAlertTester === undefined ||
                                doNotAlertTester === false)
                        ) {
                            setIsAlerted(true)
                            // setTimeout(() => {
                            //     sendPromptAlertToTester({
                            //         Id: id || "Unset",
                            //         Log: { ...props },
                            //         isMail: props.isMail || false
                            //     })
                            // }, 1);
                        }
                    }
                },
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
    status: 'error' | string
    logRetries?: {
        failureCount: number
        failureReason: string
    }
    debugProps: Omit<GetDebugObjectProps, 'information'> &
        Partial<Pick<GetDebugObjectProps, 'information'>>
}) => {
    const myDebugObjectProps = props.debugProps
    const allowEnvRetry: boolean =
        process.env.NEXT_PUBLIC_ConfigState !== CONFIG_STATE.LOCAL
    const allowShowDevHttpAlert: boolean =
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.LOCAL
    // ! ONLY USED FOR TESTING - DONT FORGET TO SWITCH  (above should NOT be commented)
    // const allowShowDevHttpAlert: boolean = false;
    // const allowEnvRetry: boolean = true;

    const mutateClientErrorLogger = useClientErrorLogger({
        id: myDebugObjectProps.id,
        severity: 'error',
    })
    const mutateClientLoggerSuccessAfterRetry = useClientErrorLogger({
        id: `successAfterRetry - ${myDebugObjectProps.id}`,
        doNotAlertTester: true,
        severity: 'warn',
    })

    const router = useRouter()
    const userStore = useUserStore()
    const [userCookies] = useAtom(cookiesUserAtom)
    const [failureCount, setFailureCount] = useState(
        props.logRetries?.failureCount || 0,
    )
    const [retryDataItems, setRetryDataItems] = useState<RetryDataProps[]>([])
    const failureCountDep = [...(props.logRetries ? [failureCount] : [])]

    // ? Trigger retry change
    useEffect(() => {
        if (props.logRetries && props.logRetries.failureCount !== failureCount)
            setFailureCount(props.logRetries.failureCount)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [failureCountDep])

    // ? Catch retry count & do mutation
    useEffect(() => {
        if (
            allowEnvRetry &&
            props.logRetries &&
            props.logRetries.failureCount > 0 &&
            props.status === 'loading' &&
            props.logRetries.failureCount !== failureCount &&
            retryDataItems.find(
                (item) =>
                    item && item.retryNumber === props.logRetries!.failureCount,
            ) === undefined
        ) {
            const retryData: RetryDataProps = {
                failureReason: props.logRetries.failureReason,
                retryNumber: props.logRetries.failureCount,
                information: `${props.logRetries.failureCount}${props.logRetries.failureCount > 1 ? 'th' : 'st'} retry of a call via react-query: ${props.debugProps.information || 'Something went wrong. Please check the details (error) for more information.'}`,
            }
            setRetryDataItems([...retryDataItems, retryData])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        allowEnvRetry,
        failureCountDep,
        props.debugProps.information,
        props.logRetries,
        props.status,
        retryDataItems,
    ])

    // ? Trigger on status change (error) & do mutation
    return useEffect(() => {
        if (!mutateClientErrorLogger.isSuccess && props.status === 'error') {
            const debugObjectProps = { ...myDebugObjectProps }
            if (debugObjectProps.information)
                debugObjectProps.information =
                    props.debugProps.information ||
                    'Something went wrong. Please check the details (error) for more information.'
            const debugObject = getDebugObject({
                ...(debugObjectProps as GetDebugObjectProps),
                router,
                userStore,
                userCookies: userCookies || undefined,
                details:
                    props.logRetries && retryDataItems
                        ? { retriesData: retryDataItems }
                        : undefined,
            })

            // Dont log errors in backend when developing - send alert to developer instead
            if (allowShowDevHttpAlert && debugObject['🚨 error']) {
                let response:
                    | AxiosResponse
                    | AxiosError
                    | RequestErrorObject
                    | string
                try {
                    // At some point its a parsed string into a jsonified string loop (idk how lol)... so convert
                    if (
                        typeof JSON.parse(debugObject['🚨 error']) === 'object'
                    ) {
                        response = JSON.parse(debugObject['🚨 error'])
                    } else if (
                        typeof JSON.parse(
                            JSON.parse(debugObject['🚨 error']),
                        ) === 'object'
                    ) {
                        response = JSON.parse(
                            JSON.parse(debugObject['🚨 error']),
                        )
                    } else if (
                        typeof JSON.parse(
                            JSON.parse(JSON.parse(debugObject['🚨 error'])),
                        ) === 'object'
                    ) {
                        response = JSON.parse(
                            JSON.parse(JSON.parse(debugObject['🚨 error'])),
                        )
                    } else {
                        // give up
                        response = debugObject['🚨 error']
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                    response = debugObject['🚨 error']
                }
                // Only send alert if response is an axios error or WiSE response
                if (
                    isAxiosError(response) ||
                    (response &&
                        (response as AxiosCombinedResponse).data &&
                        (response as AxiosCombinedResponse | AxiosError)
                            .request !== undefined) ||
                    (response &&
                        (response as AxiosCombinedResponse | AxiosError)
                            .status) ||
                    (typeof response === 'object' &&
                        (response as RequestErrorObject).isRequestErrorObject)
                ) {
                    const backendDebugObj = getRequestAndResponseObject(
                        response as RequestErrorObject,
                    )
                    let httpStatus = null
                    let apiStatus = null
                    let apiRoute = null
                    if (
                        typeof response === 'object' &&
                        (response as RequestErrorObject).isRequestErrorObject
                    ) {
                        const myRes = response as RequestErrorObject
                        httpStatus = myRes.httpStatus ? myRes.httpStatus : null
                        apiStatus = myRes.apiStatus ? myRes.apiStatus : null
                        apiRoute = myRes.response ? myRes.response.route : null
                    } else {
                        const myRes = response as
                            | AxiosError
                            | AxiosCombinedResponse
                        httpStatus =
                            myRes.request && myRes.request.status
                                ? myRes.request.status
                                : myRes.status // HTTP status
                        apiStatus = isAxiosError(myRes)
                            ? ((myRes.response?.data as WiseApiResponse) &&
                                  (myRes.response?.data as WiseApiResponse)
                                      .condition) ||
                              myRes.response?.status
                            : (myRes.data && myRes.data.condition) ||
                              myRes.status ||
                              undefined
                        apiRoute =
                            myRes.config && myRes.config.url
                                ? myRes.config.url
                                : myRes.request.responseURL // API request route
                    }

                    // Send alert to frontend developer so they can send the given json to the backend developer with ease :)
                    if (httpStatus !== 200 || (apiStatus && apiStatus > 299)) {
                        prompt(
                            `🐛 You found a possible backend bug! \n\n ${apiRoute} \n HTTP: ${httpStatus}  API: ${apiStatus} \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`,
                            JSON.stringify(backendDebugObj, null, 2),
                        )
                    }
                } else {
                    printLog({
                        reason: 'Unrecognised response',
                        debugObject,
                        response,
                    })
                }
            } else mutateClientErrorLogger.mutate(debugObject)
        }
        // Retry logger (optional - if we got correct props)
        if (
            props.status === 'success' &&
            props.logRetries &&
            retryDataItems.length > 0 &&
            !mutateClientLoggerSuccessAfterRetry.isSuccess
        ) {
            const debugObjectProps = { ...myDebugObjectProps }
            if (debugObjectProps.information)
                debugObjectProps.information =
                    'Call was retried successfully but after atleast one failure. Please check the details (retriesData) for more information.'
            const debugObject = getDebugObject({
                ...(debugObjectProps as GetDebugObjectProps),
                router,
                userStore,
                userCookies: userCookies || undefined,
                details:
                    props.logRetries && retryDataItems
                        ? { retriesData: retryDataItems }
                        : undefined,
            })

            debugObject['🚨 error'] = 'NO ERROR - retry was a success'
            mutateClientLoggerSuccessAfterRetry.mutate(debugObject)
        }
    }, [
        allowShowDevHttpAlert,
        mutateClientErrorLogger,
        mutateClientLoggerSuccessAfterRetry,
        myDebugObjectProps,
        props.debugProps.information,
        props.logRetries,
        props.status,
        retryDataItems,
        router,
        userCookies,
        userStore,
    ])
}

/**
 *
 * Creates an organised debug object for requests errors, mostly used for the custom hook useCatchRequestErrorAndCreateLog
 *
 * @prop query - Should give the query variable so that the error can be logged with great detail
 *
 */
export const getDefaultRequestDebugObject = (props: {
    id: string // usually the custom hook or queryKey/mutationKey
    information?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: UseQueryResult<any, unknown> | UseMutationResult<any, any, any>
    details?: GetDebugObjectProps['details']
}): GetDebugObjectProps => {
    const myQuery = props.query || null
    const defaultInformationMessage =
        'Something went wrong while trying to do a HTTP request. Please check the details (error) for more information.'

    return {
        id: `CALL - ${props.id || 'unknown'}`,
        error:
            myQuery && myQuery.error
                ? typeof myQuery.error !== 'string'
                    ? JSON.stringify(myQuery.error)
                    : myQuery.error
                : 'Not found...',
        // ? Dynamically choose detailed information about the error
        information:
            myQuery &&
            myQuery.error &&
            !isAxiosError(myQuery?.error) &&
            (myQuery.error as AxiosCombinedResponse).status &&
            (myQuery.error as AxiosCombinedResponse).status !== 200
                ? 'Something went wrong in the request - Expected 200 HTTP status but got something different'
                : myQuery &&
                    myQuery.error &&
                    myQuery?.error.response &&
                    myQuery?.error!.response?.data &&
                    myQuery?.error!.response!.data.condition &&
                    myQuery?.error.response.data.condition <= 299
                  ? 'Something went wrong in the request - Expected > 299 API status but got something different'
                  : myQuery &&
                      myQuery?.error &&
                      myQuery?.error!.data &&
                      myQuery?.error!.data!.condition &&
                      myQuery?.error!.data!.condition > 299
                    ? 'Something went wrong in the request - Expected > 299 API status but got something different'
                    : props.information
                      ? props.information
                      : defaultInformationMessage,
        caughtAt:
            'useEffect from useCatchRequestErrorAndCreateLog with id: ' +
            props.id,
        details: {
            ...props.details,
            retries: myQuery
                ? myQuery.failureCount
                : 'No query data (failureCount) found...',
            data: myQuery ? myQuery.data : 'No query data (data) found...',
        },
    }
}

/**
 *
 * Creates a simple request and response object - mostly used to send to backend dev
 *
 * @prop res - Axios response
 *
 */

export const getRequestAndResponseObject = (
    res: AxiosError | AxiosCombinedResponse | RequestErrorObject,
) => {
    let method: string | undefined = 'Not found'
    let route = 'Not found'
    let body: string | object = 'Not found'
    let apiStatus = null
    let httpStatus = null
    let apiResponse: string | object | null = 'Not found'

    if (
        typeof res === 'object' &&
        (res as RequestErrorObject).isRequestErrorObject
    ) {
        const myRes = res as RequestErrorObject
        method = myRes.response ? myRes.response.method : 'Not found'
        route = myRes.response ? myRes.response.route : 'Not found'
        body = myRes.response ? myRes.response.body : 'Not found'
        httpStatus = myRes.httpStatus ? myRes.httpStatus : null
        apiStatus = myRes.apiStatus ? myRes.apiStatus : null
        apiResponse = myRes.response ? myRes.response : 'Not found'
    } else {
        const myRes = res as AxiosError | AxiosCombinedResponse
        method = myRes.request
            ? myRes.request.method
            : myRes.config?.method || 'Not found'
        route =
            myRes.request && myRes.request.myResponseURL
                ? myRes.request.myResponseURL
                : myRes.config?.url || 'Not found'
        body =
            method && method.toUpperCase() !== 'POST'
                ? null
                : myRes.request && myRes.request.data
                  ? myRes.request.data
                  : myRes.config?.data || {}
        httpStatus =
            myRes.request && myRes.request.status
                ? myRes.request.status
                : myRes.status // HTTP status
        apiStatus =
            !isAxiosError(myRes) && myRes.data
                ? myRes.data.condition && myRes.data.condition
                : myRes.status || 'Not found'
        apiResponse =
            !isAxiosError(myRes) && myRes.data
                ? myRes.data.data !== undefined
                    ? myRes.data.data
                    : myRes.data
                : 'Not found'
    }

    return {
        ['📡 request']: {
            method,
            route,
            body: body ? JSON.parse(body as string) : 'Not found',
        },
        ['📩 response']: {
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
    const error =
        props.error &&
        typeof props.error === 'object' &&
        JSON.stringify(props.error)
            ? JSON.stringify(props.error)
            : props.error
    const localUserData = props.userStore?.userData as UserData & {
        createdBy: string
        language: string
    }
    const userData = props.userStore?.userData
        ? {
              id: localUserData.id,
              firstName: localUserData.firstName,
              lastName: localUserData.lastName,
              email: localUserData.email,
              createdBy: localUserData.createdBy!,
              loggedIn: localUserData.loggedIn,
              loggedSocial: localUserData.loggedSocial,
              language: localUserData.language,
              lastLoginOrigin: localUserData.lastLoginOrigin,
              talentUserToken: localUserData.talentUserToken,
          }
        : null

    return {
        isMail: props.isMail || false /* needs to stay here */,
        ['🐛 id']: props.id,
        ['💬 information']: props.information,
        ['🚨 error']: typeof error === 'string' ? error : props.error,
        ['📌 location']: {
            project: 'WiSE Home',
            env: process.env.NEXT_PUBLIC_ConfigState || null,
            caughtAt: props.caughtAt || props.id,
            route: typeof window === 'undefined' ? null : window.location.href,
        },
        ['🔍 details']: {
            ...props.details,
            time: dayjs().format(DATE_FORMAT.DAY_MONTH_YEAR_TIME),
            loggedIn: props.userStore?.userData?.loggedIn || false,
            response:
                props.res === 'Error-callbacks'
                    ? 'No response (Error-callbacks): Something went wrong in the callbacks, check the error in details'
                    : props.res || null,
            prevRoutes: props.prevRoutes || [],
            docReferrer:
                typeof document === 'undefined'
                    ? null
                    : document.referrer || null,
            ['901.userData']: props.userStore ? userData : null,
            ['902.userCookies']: props.userCookies ? props.userCookies : null,
        },
    }
}

/**
 *
 * Saves debug object in logs so we can debug it - used to log unexpected cases / errors
 *
 * @param props
 *
 */
export const saveCaseInLogs = (
    props: Omit<HttpErrorLoggerProps, 'res' | 'severity'>,
) => {
    // if (props.mutateClientErrorLogger.isSuccess) return
    const allowShowDevHttpAlert: boolean =
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.LOCAL
    // ! ONLY USED FOR TESTING - DONT FORGET TO SWITCH  (above should NOT be commented)
    // const allowShowDevHttpAlert: boolean = false;

    const debugObj = getDebugObject({
        isMail: props.isMail,
        id: props.id,
        information: props.information,
        router: props.router,
        userStore: props.userStore,
        userCookies: props.userCookies || undefined,
        prevRoutes: props.prevRoutes,
        details: props.details,
        error: props.error || undefined,
    })

    // return props.mutateClientErrorLogger.mutate({
    //     ...debugObj
    // });
    if (allowShowDevHttpAlert) {
        // prompt(`🚨 You found a possible bug! \n\n '${props.error || props.information}' \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`, JSON.stringify(debugObj, null, 2));
    } else {
        return props.mutateClientErrorLogger.mutate({
            ...debugObj,
        })
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
export function sendPromptAlertToTester(
    json:
        | {
              Id: string
              Log: ReturnType<typeof getDebugObject>
              isMail: boolean
          }
        | ReturnType<typeof getDebugObject>,
) {
    if (
        // process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.LOCAL ||
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.DEVELOPMENT ||
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.TEST
    ) {
        const tempJson: ReturnType<typeof getDebugObject> =
            typeof json === 'object' && 'Log' in json
                ? {
                      ...json.Log,
                      '🐛 id': json.Id,
                  }
                : {
                      ...json,
                      '🐛 id': json['🐛 id'],
                  }

        if (tempJson['🔍 details'] && tempJson['🔍 details']['901.userData'])
            (tempJson['🔍 details']['901.userData'] as unknown) =
                'Check office logs'
        if (tempJson['🔍 details'] && tempJson['🔍 details'].response)
            tempJson['🔍 details'].response = 'Check office logs'
        printTriggerAndExpectedBehaviour({
            id: 'sendPromptAlertToTester',
            expected: 'Tester should receive an alert with debug info',
            method: 'Case',
            trigger: 'Unexpected behaviour',
            details: { debugObj: tempJson },
        })

        return prompt(
            `🐛 You found a bug! \n\n ID: ${tempJson['🐛 id']} \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`,
            JSON.stringify(tempJson, null, 2),
        )
    }
}
export type HttpErrorLoggerProps = {
    id: string
    information: string
    severity?: 'LOW' | 'MEDIUM' | 'HIGH'
    res?: AxiosResponse | AxiosError | 'Error-callbacks' | null // Error-callbacks means that something went wrong in the handlers where the hook used a callback and has something wrong in it
    error?: string
    router: AppRouterInstance
    prevRoutes?: string[]
    userStore: UserStore
    userCookies?: CookiesUser | false
    mutateClientErrorLogger: ReturnType<typeof useClientErrorLogger>
    isMail?: boolean
    details?: { [key: string]: unknown }
}

export interface GetDebugObjectProps {
    isMail?: boolean
    id: string
    information: string
    caughtAt?: string
    router?: AppRouterInstance
    userStore?: UserStore
    userCookies?: CookiesUser
    details?: { [key: string]: unknown }
    res?: HttpErrorLoggerProps['res']
    error?: string
    prevRoutes?: string[]
}

export interface RetryDataProps {
    information: string
    retryNumber: number
    failureReason: string
}
