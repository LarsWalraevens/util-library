// example method to change an item in a complex object usestate
const editStateItem = (key, value) => setMyState(
    produce((draft) => {
        draft[key] = value;
    })
)