import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    isAxiosError,
} from 'axios'
import chalk from 'chalk'
import { CONFIG_STATE } from '../constants'
import { getShowDebugLogs } from './my-methods'

/**
 *
 * Customise everything you want to change to the handler behaviour below
 *
 */

const project = process.env.NEXT_PUBLIC_ProjectName || 'Project'
const getSimpleApiRoute = (route: string) =>
    route.replace((process.env.NEXT_PUBLIC_UriHomeApi as string) || '', '')

/**
 *
 * ############################################################################
 *
 * These are handlers for http/api requests. Its mostly useful for
 * easier communication between developers (frontend-backend) because of the
 * console logging.
 *
 * More details can be found at the methods
 *
 * ############################################################################
 */

/**
 * Sends an axios get request with addition plugins like transform response data, debug logs, etc
 * 
 * @param route - API route to send the request
 * @param config - config of the request
 * @param onResponse - Callback - Do something when you get any response (AxiosResponse | AxiosError)
 * TODO: remove below prop - use select prop in react-query instead
 * @param transformResponseData - Callback - Manipulate returned data
 * @param hideDebugLogs - whether to hide debug logs
 * @param information - debug information for more context (object type)
 * @param errorLogger - error logger that logs errors to server
 * @param isSecurityBreach - Dont throw sensitive data in errors (thrown errors can be logged)
 * 
 * @example 
 * useQuery<T>({
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
export const sendAxiosGetRequest = (props: Omit<AxiosRequestProps, 'body'>) => {
    return axios
        .get(`${props.route}`, props.config || {})
        .then((res: AxiosResponse) => {
            // ? Debug & request handler
            // ? If status is ok, it will return whatever is in the transformResponseData - make sure you return whatever you want so that it will be in the server state
            return myRequestHandler({
                response: res,
                transformResponseData: props.transformResponseData,
                onResponse: props.onResponse,
                isSecurityBreach: props.isSecurityBreach,
                hideDebugLogs: props.hideDebugLogs,
                information: props.information,
                additionalTitleLog: props.additionalTitleLog,
            })
        })
        .catch((error: AxiosError) => handleCatchError(error, props.information))
}

/**
 * Sends an axios post request with addition plugins like transform response data, debug logs, etc
 * 
 * @param route - API route to send the request
 * @param body - body of the request
 * @param config - config of the request
 * @param t - translation function
 * @param onResponse - Callback - Do something when you get any response (AxiosResponse | AxiosError)
 * TODO: remove below prop - use select prop in react-query instead
 * @param transformResponseData - Callback - Manipulate returned data
 * @param hideDebugLogs - whether to hide debug logs
 * @param information - debug information for more context (object type)
 * @param isSecurityBreach - Dont throw sensitive data in errors (thrown errors can be logged)
 * 
 * @example
 * useMutation<T, unknown, BodyType>({
    onError: (err) => toast.error("Something went wrong"),
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
    }),
    ...
  })
 * 
 */
export const sendAxiosPostRequest = (
    props: Omit<AxiosRequestProps, 'body'> & {
        body: NonNullable<AxiosRequestProps['body']>
    },
) => {
    return axios
        .post(`${props.route}`, props.body || {}, props.config || {})
        .then((res: AxiosResponse) => {
            // ? Debug & request handler
            // ? If status is ok, it will return whatever is in the transformResponseData - make sure you return whatever you want so that it will be in the server state
            return myRequestHandler({
                response: res,
                transformResponseData: props.transformResponseData,
                onResponse: props.onResponse,
                isSecurityBreach: props.isSecurityBreach,
                hideDebugLogs: props.hideDebugLogs,
                information: props.information,
                additionalTitleLog: props.additionalTitleLog,
            })
        })
        .catch((error: AxiosError) => handleCatchError(error, props.information))
}

/**
 *
 * Shared catch handler used by sendAxiosGetRequest and sendAxiosPostRequest
 *
 */
function handleCatchError(
    error: AxiosError,
    information: RequestHandlerProps['information'],
): never {
    console.error(error)
    const showDebugLogs = getShowDebugLogs()
    let debugObj: ReturnType<typeof doMyResponseClientLogs> | null = null

    if (error && error.response && error.response.status !== 200) {
        debugObj = doMyResponseClientLogs({
            response: error,
            information,
        })
    }

    if (
        debugObj &&
        debugObj?.['📩 response'] &&
        process.env.NEXT_PUBLIC_ConfigState === CONFIG_STATE.PRODUCTION &&
        !showDebugLogs
    ) {
        delete debugObj?.['📡 request']?.body
        delete debugObj?.['📩 response']?.apiResponse
    }

    throw debugObj ? { message: error.message, debug: debugObj } : error
}

/**
 *
 * The request handler that handles all axios requests - debug logs, error loggings, call data handlers etc
 *
 */
export function myRequestHandler(props: RequestHandlerProps) {
    // Accepted parameters of this method
        const {
            response,
            transformResponseData,
            onResponse,
            hideDebugLogs,
            information,
            additionalTitleLog,
            isSecurityBreach,
        } = props
        const route = !response
            ? 'NO RESPONSE'
            : !response.request
              ? 'NO REQUEST'
              : response.request.responseURL // API request route
        const status = response.request
            ? response.request.status
            : response.status // HTTP status

        const apiStatus: number | null | undefined = isAxiosError(response)
            ? ((response.response?.data as ApiResponse) &&
                  (response.response?.data as ApiResponse).condition) ||
              response.response?.status
            : (response.data && response.data.condition) ||
              response.status ||
              undefined

        // ? Handle error conditional
        // if (!props.response || status !== 200 || isAxiosError(props.response) || apiStatus !== 200) {
        // Custom if - api statuses above 299 are handled as errors
        if (
            !props.response ||
            status !== 200 ||
            isAxiosError(props.response) ||
            !apiStatus ||
            (apiStatus && parseInt(apiStatus.toString()) > 299)
        ) {
            // ? Debug logger
            handleDebugLogs({
                status,
                route,
                response,
                information,
                hideDebugLogs: hideDebugLogs || false,
                additionalTitleLog,
            })

            // ? Throw something in onResponse to catch specific statuses or API statuses
            if (onResponse) {
                onResponse(response)
            }

            // ? Now you can do this to handle general alerts
            handleDebugLogs({
                status,
                route,
                response,
                transformResponseData: transformResponseData,
                onResponse: onResponse,
                hideDebugLogs: true,
                isSecurityBreach,
            })

            // ? Throw an error with detailed stringified error so that error state is true & we error reason is the stringified error
            throw JSON.stringify(
                getRequestErrorObject({
                    response: response,
                    isSecurityBreach: isSecurityBreach || false,
                }),
                null,
                2,
            )
        }

        // ! Handle success conditional
        // ? Will trigger if its 200 HTTP status and has expected props
        else {
            // ? Debug logger
            handleDebugLogs({
                status,
                route,
                response,
                transformResponseData: transformResponseData,
                onResponse: onResponse,
                hideDebugLogs: !!props.hideDebugLogs,
                information,
                additionalTitleLog,
                isSecurityBreach,
            })

            // ? Throw something in onResponse to catch specific cases or API statuses
            if (onResponse) {
                onResponse(response)
            }
            // !? Return transformResponseData function so you can manipulate the data received and use it when the API status is 200
            return !apiStatus || apiStatus !== 200
                ? null
                : transformResponseData
                  ? transformResponseData(response as AxiosResponse)
                  : !(response as AxiosResponse) &&
                      !(response as AxiosResponse).data.data
                    ? null
                    : (response as AxiosResponse).data.data === 'No Data'
                      ? null
                      : (response as AxiosResponse).data.data
        }
}

/**
 *
 * Handles debug logs and alerts according to the response, creates a handy object to debug with
 *
 */
export function handleDebugLogs(props: HandleDebugLogsProps) {
    // ? (console) Debug-logs toggler for request handle
    const showDebugLogs = getShowDebugLogs()

    const {
        response,
        status,
        hideDebugLogs,
        route,
        transformResponseData,
        onResponse,
        information,
        additionalTitleLog,
    } = props

    const apiResponse = !isAxiosError(response)
        ? response?.data
        : response?.response?.data
    const apiStatus = isAxiosError(response)
        ? (response.response?.data as ApiResponse).condition ||
          response.response?.status
        : (response.data as ApiResponse).condition || response.status || null
    const method = response?.config?.method ?? null
    const body = response?.config?.data
        ? JSON.parse(response.config.data)
        : null

    // ? Customise your debug log object here
    const debugObject: RequestLogProps = {
        ['📡 request']: {
            method,
            route,
            body,
        },
        ['📩 response']: {
            httpStatus: status,
            apiStatus,
            apiResponse,
        },
        ['🛠️ settings']: {
            transformResponseData: transformResponseData
                ? transformResponseData.toString()
                : null,
            onResponse: onResponse ? onResponse.toString() : null,
            project,
            hideDebugLogs,
        },
    }

    let methodLog = ''

    switch (status) {
        case 200:
            if (apiStatus === 200) {
                methodLog = transformResponseData
                    ? 'transformResponseData (found)'
                    : 'transformResponseData (NOT FOUND)'
                debugObject['🛠️ settings'].log = methodLog
            } else {
                methodLog = transformResponseData
                    ? 'transformResponseData (found) did not trigger because API status was not 200'
                    : 'Api status was not 200'
                debugObject['🛠️ settings'].log = methodLog
            }
            break
        case 400:
            methodLog =
                'This request had a backend error, check the server tab and call or use the debug logs'
            debugObject['🛠️ settings'].log = methodLog
            break
        case 404:
            methodLog = 'This request route was not found'
            debugObject['🛠️ settings'].log = methodLog
            break
        case 500:
            methodLog =
                'This request had a SERVER error, please contact support'
            debugObject['🛠️ settings'].log = methodLog
            break
        default:
            methodLog = 'Something went wrong'
            debugObject['🛠️ settings'].log = methodLog
            break
    }
    debugObject['🛠️ settings'].log =
        `${debugObject['🛠️ settings'].log} & ${onResponse ? 'onResponse (found)' : 'onResponse (NOT FOUND)'}`

    const apiRoute = getSimpleApiRoute(route)
    if (information) debugObject['🔍 information'] = information

    if (!hideDebugLogs && showDebugLogs === true) {
        const generalMessage =
            status === 200 && apiStatus && apiStatus <= 299
                ? chalk.bold(`✅ ${status} (${apiStatus}):`)
                : chalk.bold(`🛑 ${status} (${apiStatus || 'Unknown'}):`)
        console.log(
            generalMessage,
            apiRoute + '\n\n',
            additionalTitleLog ? `${additionalTitleLog} \n\n` : '',
            debugObject,
        )

        return debugObject
    }
    return null
}

/**
 *
 * For some axios errors, the console logs dont show up from my debug-handler, this method will do that
 *
 */
export function doMyResponseClientLogs(props: MyResponseClientLogs) {
    // Accepted parameters of this method
    // ? Debug logger
    const { response, information } = props

    const route = !response
        ? null
        : !response.request
          ? null
          : response.request.responseURL // API request route
    const status = response.request ? response.request.status : response.status // HTTP status
    return handleDebugLogs({
        status,
        route,
        response,
        information,
        additionalTitleLog: 'Caught (doMyResponseClientLogs)',
    })
}

/**
 *
 * Used object for when error is thrown - for more information about the error & reason
 *
 */
export function getRequestErrorObject(props: {
    response: AxiosError | AxiosCombinedResponse
    reason?: string
    isSecurityBreach?: boolean
}): RequestErrorObject {
    const res = props.response
    const httpStatus =
        res.request && res.request.status ? res.request.status : res.status // HTTP status
    const method = res.config ? res.config.method : 'Not found'
    const route =
        res.request && res.request.responseURL
            ? res.request.responseURL
            : res.config?.url || 'Not found'
    const body =
        method && method.toUpperCase() !== 'POST'
            ? null
            : res.request && res.request.data
              ? res.request.data
              : res.config?.data || {}

    const apiStatus: number | null =
        !isAxiosError(res) && res.data
            ? res.data.condition && res.data.condition
            : res.status || null
    // ! Somehow in office it returns a fucked up object (because of returned data of BE with error reason in it) - so just dont log it...
    // const apiResponse = !isAxiosError(res) && res.data ? res.data : "Not found";

    return {
        reason: props.reason
            ? props.reason
            : apiStatus && apiStatus > 299
              ? 'Something went wrong in the request - Expected > 299 API status but got something different'
              : 'Unknown',
        apiStatus: apiStatus || null,
        httpStatus,
        isRequestErrorObject: true,
        response: {
            method,
            route,
            body: props.isSecurityBreach ? 'SECURITY CONDITION' : body,
            apiStatus,
            raw: props.isSecurityBreach ? 'SECURITY CONDITION' : res,
        },
    }
}

/**
 *
 * Types and interfaces for the request handlers
 *
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AxiosCombinedResponse<T = any> = AxiosResponse<ApiResponse<T>>

export interface RequestErrorObject {
    reason: string
    apiStatus: number | null
    httpStatus: number | null
    response: {
        method?: string
        route: string
        body: object | string
        apiStatus: number | null
        raw: object | string
        response?: ApiResponse
    } | null
    isRequestErrorObject: true
}

interface HandleDebugLogsProps extends RequestHandlerProps {
    status: number
    route: string
}

interface RequestHandlerProps {
    response: AxiosError | AxiosCombinedResponse
    isSecurityBreach?: boolean
    hideDebugLogs?: boolean
    additionalTitleLog?: string
    onResponse?: (res: AxiosError | AxiosCombinedResponse) => void
    transformResponseData?: (res: AxiosCombinedResponse) => unknown | null
    information?: { [key: string]: unknown } // Log extra client states for more information
}

export interface AxiosRequestProps extends Omit<
    RequestHandlerProps,
    'response'
> {
    config?: AxiosRequestConfig | undefined
    route: string
    body?: { [key: string]: unknown }
}

type MyResponseClientLogs = {
    response: AxiosError
    information: RequestHandlerProps['information']
}

export interface ApiResponse<T = unknown> {
    data: T
    condition: number
    details: string | null
    isDataCompressed: boolean
    reflection: unknown
}

interface RequestLogProps {
    ['📡 request']: {
        method: string | null
        route: string
        body?: object
    }
    ['📩 response']: {
        httpStatus: number
        apiStatus: number | null | undefined
        apiResponse: unknown
    }
    ['🔍 information']?: HandleDebugLogsProps['information']
    ['🛠️ settings']: {
        transformResponseData: string | null
        onResponse: string | null
        project: string
        hideDebugLogs: boolean | undefined
        log?: string
    }
}
