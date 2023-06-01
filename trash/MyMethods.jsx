import Moment from 'moment';
import { useEffect } from 'react';
import { Helmet } from "react-helmet";

// Returns date in string format UTC -> regular format given in properties
export function getDate(date, format) {
    var dateFormat = new Moment(date);
    var local = dateFormat.utc(dateFormat).local();
    return local.format(format);
}

// Checks if current device is mobile
export function isMobileDevice() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera); //eslint-disable-line
    return check;
};

// checks if link has http
export function postLink(link) {
    if (link.includes("http")) {
        return link;
    } else {
        return "http://" + link;
    }
}

// remove item from url parameter
export function removeParam(key, sourceURL) {
    try {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
        }

        return rtn;
    }
    catch (error) {
        console.error(error)
    }
}

export function getPathWithParams() {
    var parameters = {};
    var searchString = location.search.substr(1);
    var pairs = searchString.split("&");
    var parts;
    for (var i = 0; i < pairs.length; i++) {
        parts = pairs[i].split("=");
        var name = parts[0];
        var data = decodeURI(parts[1]);
        parameters[name] = data;
    }
    return parameters;


}

// group check if items are valid and arent any of the 'checkfor' items -> else its not valid
export function isValid(toCheck, checkFor) {
    try {
        if (toCheck === null) { return false }
        if (toCheck === undefined) { return false }
        if (toCheck.length <= 0) { return false }

        if (checkFor === null) { return false }
        if (checkFor === undefined) { return false }
        if (checkFor.length <= 0) { return false }

        var result = true;

        for (let i = 0; i < toCheck.length; i++) {
            if (result === false) {
                break;
            } else {
                for (let y = 0; y < checkFor.length; y++) {
                    if (result === false) { break; }
                    if (toCheck[i] === checkFor[y]) {
                        result = false;
                        throw result;
                    }
                }
            }

        }
        return result;
    }
    catch (err) {
        return false;
    }
}

// HANDLE OUTSIDE CLICK  
// example; useOutsideAlerter(wrapperRef, () => setShowOptions(false));
export function useOutsideAlerter(ref, onChange) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                onChange();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onChange]);
}

// HANDLE COPY ITEM/TEXT
export function textToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

// SEO TRANSLATION HANDLER 
export function handleDynamicSeoItem(text, items) {
    items.forEach(item => {
        while (text.includes(item[0])) {
            if (text.includes(item[0])) {
                text = text.replace(item[0], item[1]);
            }
        }
    })
    return text;
}


export function setPageSeo(title, description, keywords) {
    return <Helmet
        title={title}
        meta={[
            {
                name: `description`,
                content: description
            },
            {
                name: `keywords`,
                content: keywords
            },
            {
                property: "og:title",
                content: title
            },
            {
                property: "og:description",
                content: description
            },
            {
                property: "twitter:title",
                content: title
            },
            {
                property: "twitter:description",
                content: description
            },
        ]}
    ></Helmet>
}

// update url search parameter
export function updateParameter(key, val) {
    var uri = window.location.pathname + window.location.search
        .replace(RegExp("([?&]" + key + "(?=[=&#]|$)[^#&]*|(?=#|$))"), "&" + key + "=" + encodeURIComponent(val))
        .replace(/^([^?&]+)&/, "$1?");
    return uri;
}

// fancy styling for logs
export function Console(text) {
    console.log(`%c ${text}`, 'background: #222; color: #bada55');
}

// generic add item to state and give it an id
export function handleReducerAddPlusId(state, action) {
    var yourItem = action.payload;
    if (!isValid([state], [undefined, false, null])) {
        let newItems = [];
        yourItem.id = 1;
        newItems.push(yourItem);
        return newItems;
    } else {
        if (!isValid([state], [undefined, false, null])) {
            yourItem.id = 1;
        } else {
            yourItem.id = (state.length) + 1
        }
        return [
            ...state,
            action.payload
        ]
    }
}