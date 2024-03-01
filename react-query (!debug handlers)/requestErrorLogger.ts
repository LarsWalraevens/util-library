import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { NextRouter } from "next/router";
import { useState } from "react";
import envir from "../../env.json";
import { CONFIG_STATE, DATE_FORMAT, ENVARIABLE } from "../data/enums";
import { UserStore } from "../store/userStore";
import { sendPromptAlertToTester } from "./MyMethods";
import { sendAxiosPostRequest } from "./myRequestHandlers";

/** 
 * 
 * @param id Please give an <string> id to the function so that we can identify this specific item to make it easier to debug
 * @returns Mutation to insert logs (frontend errors) in database
 * 
 */
export const useClientErrorLogger = (id?: string): any => {
    const { t } = useTranslation();
    const [isAlerted, setIsAlerted] = useState<boolean>(false);

    return useMutation({
        mutationFn: (props: { [key: string]: any }) => sendAxiosPostRequest({
            route: `vx/insert/logs/client`,
            t,
            body: {
                Log: { ...props },
                isMail: envir.Variables.ConfigState === CONFIG_STATE.LOCAL ? false : (props.isMail || false)
            },
            onResponse: (res) => {
                if (!isAxiosError(res)) {
                    console.log(`%c⚠️ Your error has been logged. Please let us know more when you can at ${ENVARIABLE.CONTACTEMAIL} or ${ENVARIABLE.CONTACTPHONE}`, "font-weight: bold; font-size: 22px; color:red;")
                    // Let tester / developer know something went wrong in browser alert
                    if (!isAlerted) {
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
        }),
        mutationKey: [id ? `mutateErrorLog-${id}` : `mutateErrorLog`],
        retry: false
    })
}

/**
 * 
 * Get context default debug object that gives more context to who what where when and stuff
 * 
 * @param props 
 * @returns Context default object
 */
export const getContextDefaultObject = (props: {
    id: string;
    information: string;
    router?: NextRouter;
    userStore?: UserStore;
}): { [key: string]: any } => {
    const { router, userStore, id, information } = props;
    return {
        route: router ? router.asPath : window.location.href,
        routerPath: router ? router.pathname : "",
        routerLang: router ? router.locale : "",
        userData: userStore ? userStore.userData : "",
        project: "WiSE Home",
        id: id,
        time: dayjs().format(DATE_FORMAT.DAY_MONTH_YEAR_TIME),
        information: information
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
export const getDebugObject = (props: {
    isMail?: boolean;
    id: string;
    information: string;
    origin?: string;
    router?: NextRouter;
    userStore?: UserStore;
    details?: { [key: string]: any };
    res?: AxiosResponse | AxiosError | null;
}) => {
    const myDefaultDebugObject = !props.router || !props.userStore ? null : getContextDefaultObject({
        router: props.router,
        id: props.id,
        information: props.information,
        userStore: props.userStore
    });
    return {
        isMail: props.isMail, /* needs to stay here */
        ["🐛 id"]: props.id,
        ["💬 information"]: props.information,
        ["📌 location"]: {
            project: "WiSE Home",
            origin: `${props.origin || "Unk"}`,
            method: "saveErrorInLogs",
            route: !props.router ? null : props.router.asPath,
            id: props.id,
        },
        ["🔍 details"]: {
            response: props.res || "No API response found",
            default: myDefaultDebugObject,
            extra: props.details || "No details shared"
        },
    }
}

/**
 * 
 * Saves debug object in logs (mutation call) so we can debug it
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
            origin: props.origin,
            router: props.router,
            userStore: props.userStore,
            details: props.details,
            res: props.res
        })
        props.mutateClientErrorLogger.mutate({
            ...debugObj
        });
    }
}

export type HttpErrorLoggerProps = {
    id: string;
    information: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    res: AxiosResponse | AxiosError | null;
    router: NextRouter;
    userStore: UserStore;
    mutateClientErrorLogger: UseMutationResult<any, any, any>;
    isMail?: boolean;
    origin?: string;
    details?: { [key: string]: any };
}
