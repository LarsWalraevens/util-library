// set axios defaults when using 'axios' from import: 
axios.defaults.baseURL = envir.Variables.WiseApiUrl;
axios.defaults.headers.common['x-functions-key'] = envir.Variables.WiseApiKey;
axios.defaults.headers.post['Content-Type'] = 'application/json';