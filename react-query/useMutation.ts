// https://tanstack.com/query/latest/docs/framework/react/reference/useMutation#usemutation

// Usually used to make changes with the help of your API (ex; pressing save button)
const useMyMutationHook = () => {
    return useMutation({
        mutationKey: ["myCacheResultKeyOfThisCall"],
        mutationFn: (propsFn) => axios.post("<my-api-call>", {
            bodyItem1: propsFn.myBodyData1,
            bodyItem2: propsFn.myBodyData2
        }).then((data) => {
            // can manipulate client state data here
            const manipulateData = data;
            // ALWAYS have to return something so that there is something in the client state & cache from react-query       
            return manipulateData
        }).catch((error) => {
            // your error logic here
            console.error(error);
        }),
        onSuccess: (res) => {
            // do something on success
        },
        onError: (err) => {
            // do something on error
        },
        onSettled: (res) => {
            // do something on settled - regardless if it failed or not
        }
    })
}


// HOW TO USE HOOK?
const mutateMyHook = useMyMutationHook();

// mutateMyHook.data -> get data that was returned - usually you dont use this for a mutation but you can

/**
 * 
<button
disabled = {mutateMyHook.isLoading}
onClick = {() => mutateMyHook.mutate({
    bodyItem1: "myBodyData1",
    bodyItem2: "myBodyData2"
})}
>
</button>
 * 
 */