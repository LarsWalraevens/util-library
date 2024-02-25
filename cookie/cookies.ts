import cookie from "cookie";

const cookies = cookie.parse(document.cookie);

// set a cookie
document.cookie = cookie.serialize("rememberUser", token, { path: "/", secure: true });

// get a cookie
cookies.token
