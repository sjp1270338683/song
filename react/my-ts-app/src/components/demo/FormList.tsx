import react from 'react'
import { Form, Button, Input } from 'antd';

const FormList = () => {

    return (
        <Form name='basic' initialValues={{}} onFinish={() => { }}>
            <Form.Item label='测试'>
                <Form.List name='names' initialValue={[{}]}>
                    {(fields, { add, remove }) => {
                        return (
                            <>
                                {
                                    fields?.map(({ key, name, ...reastFields }) => {
                                        return (
                                            <div key={key}>
                                                <Form.Item name={[name, 'name']} initialValue={''}  {...reastFields} label='姓名'>
                                                    <Input />
                                                </Form.Item>
                                                <Button onClick={() => add()}>+</Button>
                                                <Button onClick={() => remove(name)}>-</Button>
                                            </div>
                                        )
                                    })
                                }
                            </>
                        )
                    }
                    }
                </Form.List>
            </Form.Item>
        </Form>
    )
}
export default FormList;