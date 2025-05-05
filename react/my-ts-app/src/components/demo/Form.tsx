import react from 'react';
import { Form, Input, Button, Checkbox } from 'antd';

const FormDemo = () => {

    return (
        <Form name='basic' initialValues={{}} onFinish={() => { }}>
            <Form.Item label='ces'>
                <Form.List name='names' initialValue={[{}]}>
                    {(fields, { add, remove }) => {
                        return (
                            <>
                                {
                                    fields.map(({ key, name, ...restField }) => (
                                        <>
                                            <Form.Item name={[name, 'name']} key={key}>
                                                <Input {...restField} />
                                            </Form.Item>
                                            <Button onClick={() => add()}>添加</Button>
                                            <Button onClick={() => remove(name)}>删除</Button>
                                        </>
                                    ))
                                }
                            </>
                        );
                    }}
                </Form.List>
            </Form.Item>
        </Form>
    )
}
export default FormDemo;