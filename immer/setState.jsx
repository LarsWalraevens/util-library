// example method to change an item in a complex object usestate
const editStateItem = (key, value) => setMyState(
    produce((draft) => {
        draft[key] = value;
    })
)

// update specific object in array of object using produce
setData(state =>
    produce(state, draft => {
        const itemToUpdate = draft.find(item => item.id === id);
        if (itemToUpdate) {
            itemToUpdate.data = selectedItem.data;
        }
    })
);