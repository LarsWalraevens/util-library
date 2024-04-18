// https://tanstack.com/query/latest/docs/framework/react/reference/useQuery#usequery

// Usually used to go and GET data from an API
const useMyQueryHook = (props) => {
    return useQuery({
        queryKey: ["myCacheResultKeyOfThisCall"],
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
            console.error(error);
        }),
        enabled: !!props.userData, // <-- only enable when i got userData
        retry: 4, // <-- retry 4 times if first wasnt successful
    })
}


// HOW TO USE HOOK?
const {
    data: myCustomDataVariable, // custom names to properties can be done like this - this has the manipulated data what you did in the queryFn (then fn) 
    refetch, // Means you'll do the useQuery again with the same queryKey
    isLoading, // Boolean to indicate that the query is loading
    isError // Boolean to indicate that the query has an error
} = useMyQueryHook({ userData: "myUserData" });