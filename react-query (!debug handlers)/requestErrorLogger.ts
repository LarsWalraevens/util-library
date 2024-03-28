import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { NextRouter } from "next/router";
import { useState } from "react";
import envir from "../../env.json";
import { CONFIG_STATE, DATE_FORMAT, ENVARIABLE } from "../data/enums";
import { UserStore } from "../store/userStore";
import { sendAxiosPostRequest } from "./myRequestHandlers";
import { useAtom } from "jotai";
import { prevRoutesAtom } from "@/pages/_app";

/** 
 * 
 * ! Current flaw of this hook - if you use the hook on page level, and multiple things go wrong, it will only log the first item because the "id" is not unique. Catch this by creating a custom hook for important calls.
 * TODO: Find solution to flaw ^
 * 
 * @param id Give an <string> id to the function so that we can identify this specific item to make it easier to debug and that we can identify the logged item when retrying (so it doesnt relog at a retry)
 * @returns Mutation to insert logs (frontend errors) in database
 * 
 */
export const useClientErrorLogger = (id: string): any => {
    const { t } = useTranslation();
    const [isAlerted, setIsAlerted] = useState<boolean>(false);
    const [prevRoutes] = useAtom(prevRoutesAtom);

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
            })
        },
        retry: false,
        cacheTime: 0,

    })
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
    router?: NextRouter;
    userStore?: UserStore;
    details?: { [key: string]: any };
    res?: HttpErrorLoggerProps["res"];
    error?: string;
    prevRoutes?: string[];
}) => {
    return {
        isMail: props.isMail || false, /* needs to stay here */
        ["🐛 id"]: props.id,
        ["💬 information"]: props.information,
        ["📌 location"]: {
            project: process.env.ProjectName || "My project",
            caughtAt: props.id,
            route: !props.router ? null : props.router.asPath,
            routerLang: props.router ? props.router.locale : null,
        },
        ["🚨 error"]: props.error || null,
        ["🔍 details"]: {
            time: dayjs().format(DATE_FORMAT.DAY_MONTH_YEAR_TIME),
            loggedIn: props.userStore?.userData?.loggedIn || false,
            response: props.res === "Error-callbacks" ? "No response (Error-callbacks): Something went wrong in the callbacks, check the error in details" : (props.res || null),
            extra: props.details || null,
            prevRoutes: props.prevRoutes || [],
            docReferrer: document.referrer || null,
            ["999.userData"]: props.userStore ? props.userStore.userData : null,
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
        envir.Variables.ConfigState === CONFIG_STATE.LOCAL ||
        envir.Variables.ConfigState === CONFIG_STATE.DEVELOPMENT ||
        envir.Variables.ConfigState === CONFIG_STATE.TEST
    ) {
        const tempJson: ReturnType<typeof getDebugObject> = typeof json === "object" && "Log" in json
            ? {
                ...json.Log,
                '🐛 id': json.Id,
            }
            : {
                ...json,
                '🐛 id': (json as { [key: string]: any }).Id,
            }

        if (tempJson['🔍 details'] && tempJson['🔍 details']["999.userData"]) (tempJson['🔍 details']["999.userData"] as any) = "Check office logs";
        if (tempJson['🔍 details'] && tempJson['🔍 details'].response) tempJson['🔍 details'].response = "Check office logs";
        return prompt(
            `🐛 You found a bug! \n\n ID:${tempJson['🐛 id']} \n\n Check logs in browser or copy text below to clipboard and send it to the appropriate developer: Ctrl+C, Enter`,
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
