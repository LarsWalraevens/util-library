// easy to use method to change an item in a complex object
const editFormItem = (key, value) => setProfileFormObject(
    produce((draft) => {
        draft[key] = value;
    })
)