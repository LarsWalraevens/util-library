/**
 * getShowDebugLogs is mocked to suppress all console output during tests and
 * to avoid touching localStorage/env-vars inside the test runner.
 */
jest.mock('../../../lib/utils/my-methods', () => ({
    getShowDebugLogs: jest.fn(() => false),
    printLog: jest.fn(),
    printWarning: jest.fn(),
    printAction: jest.fn(),
    printTriggerAndExpectedBehaviour: jest.fn(),
}))

import { AxiosError } from 'axios'
import {
    AxiosCombinedResponse,
    getRequestErrorObject,
    myRequestHandler,
} from '../my-request-handler'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeResponse(
    httpStatus: number,
    apiCondition: number,
    data: unknown = null,
): AxiosCombinedResponse {
    return {
        data: {
            condition: apiCondition,
            data,
            details: null,
            isDataCompressed: false,
            reflection: null,
        },
        status: httpStatus,
        statusText: 'OK',
        headers: {},
        config: {
            method: 'get',
            url: '/api/test',
            data: null,
        } as AxiosCombinedResponse['config'],
        request: { status: httpStatus, responseURL: '/api/test' },
    } as unknown as AxiosCombinedResponse
}

function makePostResponse(
    httpStatus: number,
    apiCondition: number,
    body: object,
    responseData: unknown = null,
): AxiosCombinedResponse {
    return {
        data: {
            condition: apiCondition,
            data: responseData,
            details: null,
            isDataCompressed: false,
            reflection: null,
        },
        status: httpStatus,
        statusText: 'OK',
        headers: {},
        config: {
            method: 'post',
            url: '/api/test',
            data: JSON.stringify(body),
        } as AxiosCombinedResponse['config'],
        request: {
            status: httpStatus,
            responseURL: '/api/test',
            data: JSON.stringify(body),
        },
    } as unknown as AxiosCombinedResponse
}

// ─── getRequestErrorObject ────────────────────────────────────────────────────

describe('getRequestErrorObject', () => {
    it('sets isRequestErrorObject to true', () => {
        const res = makeResponse(200, 300)
        const result = getRequestErrorObject({ response: res })
        expect(result.isRequestErrorObject).toBe(true)
    })

    it('includes the HTTP status', () => {
        const res = makeResponse(200, 300)
        const result = getRequestErrorObject({ response: res })
        expect(result.httpStatus).toBe(200)
    })

    it('includes the API condition as apiStatus', () => {
        const res = makeResponse(200, 300)
        const result = getRequestErrorObject({ response: res })
        expect(result.apiStatus).toBe(300)
    })

    it('returns the provided custom reason', () => {
        const res = makeResponse(200, 300)
        const result = getRequestErrorObject({
            response: res,
            reason: 'Custom reason',
        })
        expect(result.reason).toBe('Custom reason')
    })

    it('generates an automatic reason when apiStatus > 299', () => {
        const res = makeResponse(200, 400)
        const result = getRequestErrorObject({ response: res })
        expect(result.reason).toContain('299')
    })

    it('replaces body and raw with SECURITY CONDITION when isSecurityBreach is true', () => {
        const res = makePostResponse(200, 400, { password: 'secret' })
        const result = getRequestErrorObject({
            response: res,
            isSecurityBreach: true,
        })
        expect(result.response?.body).toBe('SECURITY CONDITION')
        expect(result.response?.raw).toBe('SECURITY CONDITION')
    })

    it('sets body to null for GET requests (no body)', () => {
        const res = makeResponse(200, 300)
        const result = getRequestErrorObject({ response: res })
        expect(result.response?.body).toBeNull()
    })

    it('includes the route in the response object', () => {
        const res = makeResponse(200, 300)
        const result = getRequestErrorObject({ response: res })
        expect(result.response?.route).toBeTruthy()
    })

    it('handles an AxiosError without a response', () => {
        const axiosError = new AxiosError('Network Error', 'ERR_NETWORK')
        const result = getRequestErrorObject({ response: axiosError })
        expect(result.isRequestErrorObject).toBe(true)
    })
})

// ─── myRequestHandler ─────────────────────────────────────────────────────────

describe('myRequestHandler', () => {
    it('returns response.data.data on a 200/200 success', () => {
        const payload = { name: 'Jane' }
        const res = makeResponse(200, 200, payload)
        const result = myRequestHandler({ response: res })
        expect(result).toEqual(payload)
    })

    it('returns the result of transformResponseData when provided', () => {
        const res = makeResponse(200, 200, { items: [1, 2, 3] })
        const result = myRequestHandler({
            response: res,
            transformResponseData: (r) => r.data.data.items as number[],
        })
        expect(result).toEqual([1, 2, 3])
    })

    it("returns null when response.data.data is 'No Data'", () => {
        const res = makeResponse(200, 200, 'No Data')
        const result = myRequestHandler({ response: res })
        expect(result).toBeNull()
    })

    it('returns null when the API condition is 200 but data.data is falsy', () => {
        const res = makeResponse(200, 200, null)
        // null data.data → falls through to the last conditional
        const result = myRequestHandler({ response: res })
        expect(result).toBeNull()
    })

    it('throws when the HTTP status is not 200', () => {
        const res = makeResponse(500, 500)
        expect(() => myRequestHandler({ response: res })).toThrow()
    })

    it('throws when the API condition is above 299', () => {
        const res = makeResponse(200, 400)
        expect(() => myRequestHandler({ response: res })).toThrow()
    })

    it('throws when an AxiosError is passed', () => {
        const axiosError = new AxiosError('Network Error', 'ERR_NETWORK', {
            method: 'get',
            url: '/api/test',
        } as AxiosCombinedResponse['config'])
        ;(axiosError as unknown as Record<string, unknown>).request = {
            status: 0,
            responseURL: '/api/test',
        }
        expect(() => myRequestHandler({ response: axiosError })).toThrow()
    })

    it('calls onResponse on a successful response', () => {
        const onResponse = jest.fn()
        const res = makeResponse(200, 200, { ok: true })
        myRequestHandler({ response: res, onResponse })
        expect(onResponse).toHaveBeenCalledWith(res)
    })

    it('calls onResponse even on an error response', () => {
        const onResponse = jest.fn()
        const res = makeResponse(200, 400)
        try {
            myRequestHandler({ response: res, onResponse })
        } catch {
            // expected throw
        }
        expect(onResponse).toHaveBeenCalledWith(res)
    })

    it('returns null when apiStatus is not 200 on the success path (e.g. 201)', () => {
        // HTTP 200 + apiStatus 201 (≤ 299 but ≠ 200) → success branch but null return
        const res = makeResponse(200, 201, { something: true })
        const result = myRequestHandler({ response: res })
        expect(result).toBeNull()
    })
})
