// https://tanstack.com/query/latest/docs/framework/react/reference/useQuery#usequery
function HookExamplePage(props) {
    const exampleQuery = useQuery({
        queryKey: ["myCacheResultKeyOfThisCall"],
        // In queryFn you can put your custom request handler like example in comments:
        // queryFn: () => sendAxiosGetRequest({
        //     route: `v2/generic/catalogues/Languages`,
        //     onResponse: (res) => {
        //         if (res && !isAxiosError(res) && res.data.data && res.data.status === 200) toast.success("Success");
        //     },
        //     transformResponseData: (res) => {
        //         return res.data.data.sort((a, b) => a.disabled ? -1 : 1);
        //     }
        //     }),
        //     ...
        // }),

        // but you can also just do a regular request
        queryFn: () => axios.post("<my-api-call>", {
            bodyItem1: "value1",
            bodyItem2: "value2"
        }).then((data) => {
            // can manipulate client state data here
            const manipulateData = data;
            // ALWAYS have to return something so that there is something in the client state & cache from react-query       
            return manipulateData
        }).catch((error) => {
            // your error logic here
            throw console.error(error);
        }),
        enabled: !!props.userData, // <-- only enable when i got userData
        retry: 4, // <-- retry 4 times if first wasnt successful
    });

    return <PageContent />
}
