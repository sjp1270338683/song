import reacr, { useState } from 'react';
import { Button } from 'antd';

enum PromiseStatus {
    pending = 'pending',
    fulilled = 'fulilled',
    rejected = 'rejected',
}

const Promise = (props: any) => {
    const [promiseStatus, setPromiseStatus] = useState<PromiseStatus>(PromiseStatus.pending); // promise的状态
    const [value, setValue] = useState<any>(undefined); // promise的值
    const [reason, setreason] = useState<any>(undefined); // promise的拒因
    const [onFulfilledCallback, setOnFulfilledCallback] = useState<any>([]); // promise的成功回调
    const [onRejectedCallback, setOnRejectedCallback] = useState<any>([]); // promise的失败回调

    const resolve = (value: any) => {
        if (promiseStatus === PromiseStatus.pending) {
            setPromiseStatus(PromiseStatus.fulilled);
            setValue(value);
            const onFulfilledCallbacks = onFulfilledCallback.forEach((callback: any) => callback(value));
            setOnFulfilledCallback(onFulfilledCallbacks);
        }
    }

    const reject = (reason: any) => {
        if (promiseStatus === PromiseStatus.pending) {
            setPromiseStatus(PromiseStatus.rejected);
            setreason(reason);
            const onRejectedCallbacks = onRejectedCallback.forEach((callback: any) => callback(reason));
            setOnRejectedCallback(onRejectedCallbacks);
        }
    }

    try { props(resolve, reject) } catch (e) { reject(e) }

    const then = (onFulfilled: any, onRejected: any) => {
        if (promiseStatus === PromiseStatus.fulilled) {
            onFulfilled(value);
        } else if (promiseStatus === PromiseStatus.rejected) {
            onRejected(reason);
        } else if (promiseStatus === PromiseStatus.pending) {
            onFulfilledCallback.push(onFulfilled);
            onRejectedCallback.push(onRejected);
        }
    }

}

export default Promise;