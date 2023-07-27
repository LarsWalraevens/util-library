// DOCS: https://ant.design/components/form

// custom form validator with message
function validatorEmptyFormItem(formItemName) {
    return ({ getFieldValue }) => ({
        validator(_, value) {
            // conditional below for error message to show
            if (getFieldValue(formItemName).trim().length === 0) {
                return Promise.reject("Message");
            }
            return Promise.resolve();
        },
    })
}

/********************************************************
 *                   HANDY PROPERTIES                   *
 *    - FORM.SETFIELDVALUE(FIELDITEMNAME, "VALUE");     *
 * - FORM.SETFIELDVALUES({FIELDITEMNAME, "VALUE"},...); *
 *                 - FORM.RESETFIELDS()                 *
********************************************************/
const [form] = Form.useForm();

<Form
    form={form}
    name="form-login"
    layout='vertical'
    initialValues={{ email: "myemail@default.com" }}
    onFinish={(res /* Your form values in object */) => console.log(res) /* Do something on submit */}
    onFinishFailed={(err /* Error state */) => console.log(err)} /* Do something when submit went wrong */
>
    <div className="mb-3">
        <Form.Item
            name="email" /* Form object name (required) */
            label="Email"
            rules={[{ required: true, message: false }, validatorEmptyFormItem("email")]}
        >
            <Input
                prefix={<span className='icon fs-small icon-nospace mr-2 icon-mail ' />}
                placeholder="Email"
                type="email"
            />
        </Form.Item>
        <Form.Item
            name="password" /* Form object name (required) */
            label="Password"
            rules={[{ required: true, message: false }]}
        >
            <Input.Password
                placeholder="Password"
                type="password"
            />
        </Form.Item>
    </div>

    <Button
        htmlType='submit'
    >
        Login
    </Button>

</Form>