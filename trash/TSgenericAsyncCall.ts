// Async promise fetch method to use to handle calls | So there is no overload seperate unnecessary files and easier work flow

import $ from 'jquery';
import { toast } from 'react-toastify';
import envir from '../../../env.json';

interface GenericPromiseProps {
    route: string;
    body?: object;
    isSubmit?: boolean; // show loading button animation
    method?: string// default GET
    event?: React.SyntheticEvent;
    callback?: (res: any) => void;
    errorCallback?: (res: any) => void;
    setAlert?: any;
    switch?: (res: any) => void; // status code handler
}


function checkAndAddLoading(props: GenericPromiseProps) {
    if (props.isSubmit) {
        $("#btn-submit").addClass("btn-loading");
    }
}
function checkAndRemoveLoading(props: GenericPromiseProps) {
    if (props.isSubmit) {
        $("#btn-submit").removeClass("btn-loading");
    }
}

export default async function genericAsyncPromise(props: GenericPromiseProps) {
    // REPLACE IMPORTANT PROJECT VALUES
    var errorConnection = "A connection error occured, please try again";
    var errorSomething = "Something went wrong, please try again";
    var logChanges = "Successfully made changes";
    var apiRoute = "yourapiroute";
    try {
        if (props.event !== undefined) {
            props.event.preventDefault();
        }
        if (props.isSubmit && props.event) {
            props.event.preventDefault();
        }
        checkAndAddLoading(props);

        var requestOptions: object | string = "";
        if (props.method === undefined || props.method.toUpperCase() === "GET") {
            requestOptions = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                },
            };
        } else {
            requestOptions = {
                method: props.method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(props.body),
            };
        }

        await fetch(apiRoute + props.route, requestOptions)
            .then(response => {
                checkAndRemoveLoading(props);
                if (props.switch === undefined) {
                    switch (response.status) {
                        case 200:
                            if (props.isSubmit) {
                                if (props.setAlert) {
                                    toast.success(logChanges);
                                }
                            }
                            return response.json();
                        case 290:
                            console.warn(`${response.status}: There was no data found in the request \n${props.route}`)
                            break;
                        case 404:
                            if (props.setAlert) {
                                toast.error(errorSomething);
                            }
                            console.error(`${response.status}: This request route was not found, probably a backend problem \n${props.route}`)
                            break;
                        case 400:
                            if (props.setAlert) {
                                toast.error(errorSomething);
                            }
                            if (props.errorCallback) {
                                props.errorCallback(response.json())
                            }
                            console.error(`${response.status}: This request had a backend error, check the server tab and call or use this  \n${props.route}`);
                            console.log(response.json());
                            break;
                        case 500:
                            if (props.setAlert) {
                                toast.error(errorConnection);
                            }
                            if (props.errorCallback) {
                                props.errorCallback(response.json())
                            }
                            console.error(`${response.status}: This request had a SERVER error, please contact support \n${props.route}`);
                            console.log(response.json());
                            break;
                        default:
                            if (props.setAlert) {
                                toast.error(errorSomething);
                            }
                            if (props.errorCallback) {
                                props.errorCallback(response.json())
                            }
                            console.error(`${response.status}: Something went wrong \n${props.route}`);
                            console.log(response.json());
                            break;
                    }
                } else {
                    props.switch(response.status);
                }
            })
            .then(data => {
                if (!data) { return console.warn("No return data") }
                if (!props.callback) { return console.log("%c 200: no callback " + " - " + props.route, 'background: #222; color: #bada55') }
                props.callback(data);
            })
            .catch(error => {
                console.error(error);

                if (props.setAlert) {
                    toast.error(errorConnection);
                }
                if (props.errorCallback) {
                    props.errorCallback(error);
                }
            })


    } catch (error) {
        console.error(error);

        if (props.setAlert) {
            toast.error(errorConnection);
        }
        if (props.errorCallback) {
            props.errorCallback(error);
        }
    }
}
