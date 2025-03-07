
import { cookiesUserAtom, prevRoutesAtom } from "@/components/layouts/app/app-wrapper";
import PageLayout from "@/components/layouts/page/page-layout";
import { ENVARIABLE } from "@/utils/data/enums";
import { saveCaseInLogs, useClientErrorLogger } from "@/utils/methods/my-request-error-methods";
import { useUserStore } from "@/utils/store/userStore";
import { Spin } from "antd";
import { useAtom } from "jotai";
import { CheckCheckIcon, CopyIcon } from "lucide-react";
import { NextPageContext } from "next";
import { useTranslation } from 'next-i18next';
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function ErrorPage(props: {
    statusCode: number, errMessage: string, ctx: NextPageContext, error?: {
        message?: string;
        stack?: string;
        name?: string;
        cause?: string;
        statusCode?: number
    }
}) {
    // UTILS
    const { t } = useTranslation();
    const mutateClientLogger = useClientErrorLogger({ id: "ERROR PAGE", severity: "error" });
    const userStore = useUserStore();
    const router = useRouter();
    const [prevRoutes] = useAtom(prevRoutesAtom);
    const [userCookies] = useAtom(cookiesUserAtom);
    const [resolveError, setResolveError] = useState<null | typeof resolvableErrorMessages[0]>(null);

    useEffect(() => {
        const resolvableErrorItem = resolvableErrorMessages.find(({ message }) => message === props.error?.message)
        if (resolvableErrorItem) return setResolveError(resolvableErrorItem)
        saveCaseInLogs({
            id: "ERROR PAGE",
            information: "A user got an unknown client error",
            details: {
                referrence: typeof window !== "undefined" && document.referrer ? document.referrer : "no refferer",
                pageProps: props
            },
            userCookies: userCookies,
            prevRoutes,
            error: props.errMessage,
            mutateClientErrorLogger: mutateClientLogger,
            userStore: userStore,
            router: router
        });
    }, [])

    return (
        <PageLayout hideSurvey hideHeader hideFooter className="flex items-center justify-center " >
            <div className="mb-[10vh] mt-[17vh]" >
                <h1 className="text-center font-bold max-lg:text-[4rem] max-md:text-[3rem] text-[5rem] mb-3">😅 Uh oh...</h1>
                <div className='sm:text-center mb-5 flex justify-center'>
                    <div className="sm:text-center max-w-[600px] max-lg:w-full text-gray-700" >
                        <p className="md:text-xl text-large font-medium mb-3 max-sm:mb-1">
                            Seems like something isn&apos;t right...
                        </p>
                        <p className="mb-2">If you continue to see this error, please contact us at <a className="link mx-1" href={`mailto:${ENVARIABLE.CONTACTEMAIL}`}>{ENVARIABLE.CONTACTEMAIL}</a> with details about what happened.</p>
                    </div>
                </div>
                <Link href="/" passHref className="max-w-[300px] mx-auto inline-block btn btn-primary" >Back</Link>
                {
                    props.error &&
                    <div className="my-8">
                        <div className="mx-auto card !p-0 w-[800px] max-lg:max-w-[95vw]">
                            {
                                resolveError ? <>
                                    <div className="font-secondary p-5">
                                        <p className="font-semibold text-medium mb-2">It looks like we already have identified this error:</p>
                                        {resolveError.component}
                                    </div>
                                </> :
                                    mutateClientLogger.isIdle ? null :
                                        mutateClientLogger.isLoading ?
                                            <div className="p-5">
                                                <div className="italic text-center text-medium text-blue-500 font-medium mb-0"><Spin className="mr-2" /> Registering your error... </div>
                                            </div> :
                                            mutateClientLogger.isSuccess ?
                                                <div className="p-5">
                                                    <p className="italic text-center text-medium text-green-500 font-medium mb-0"><CheckCheckIcon /> Your error has been registered! We will look into it... </p>
                                                </div> :
                                                null
                            }
                            <pre className="mx-auto relative text-xsm bg-slate-200 p-3 rounded-b-md max-w-[50vw]">
                                <span
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(props.error, null, 2));
                                        toast.success("Copied to clipboard");
                                    }}
                                    className="absolute hover:opacity-75 rounded-sm cursor-pointer text-gray-600 bg-slate-300 active:scale-[95%] transition ease-in-out duration-100 active:bg-focus select-none flex items-center top-0 right-0 text-sm font-secondary px-2 py-0.5 ">
                                    <CopyIcon className="mr-1" size={15} /> Copy
                                </span>
                                {JSON.stringify(props.error, null, 2)}
                            </pre>
                        </div>
                    </div>
                }
            </div>
        </PageLayout>
    );
};

ErrorPage.getInitialProps = (ctx: NextPageContext) => {
    const { res, err } = ctx;
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    const errMessage = err?.message || "Unknown error";

    const errorObj = {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        cause: err?.cause,
        statusCode: err?.statusCode
    }
    return { statusCode, errMessage, ctx, error: errorObj };
};

const resolvableErrorMessages = [
    {
        message: "Failed to read the 'localStorage' property from 'Window': Access is denied for this document.",
        component: <>
            <p>It seems like you have blocked cookies/local storage in your browser. Please allow cookies/local storage for this website.</p>
            <a href="https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document/" className="link">More info</a>
        </>
    }
]


export default ErrorPage;
