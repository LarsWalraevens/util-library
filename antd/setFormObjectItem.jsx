// Simple method to edit a form state object and set initial formitem value

const editFormItem = (key, val, setInit) => {
    if (setInit) {
        form.setFieldsValue({
            [key]: val
        });
    }
    setFormObject(produce(draft => {
        draft[key] = val;
    }))
}

const [formObject, setFormObject] = useState({
    companyName: "",
    companyVat: "",
    zipCode: "",
});

// use: onChange = {(e) => editFormItem("companyName", e.target.value)}