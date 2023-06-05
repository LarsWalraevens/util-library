// used to check if an antd form item has an empty field (or empty spaces) -> else give error on submit
// rules = { [{ required: true, message: false }, validatorEmptyFormItem("reaction")]}

export function validatorEmptyFormItem(name) {
    return ({ getFieldValue }) => ({
        validator(_, value) {
            if (getFieldValue(name).trim().length === 0) {
                return Promise.reject(false);
            }
            return Promise.resolve();
        },
    })
}