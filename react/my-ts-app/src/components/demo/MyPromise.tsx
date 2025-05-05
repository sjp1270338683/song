import react from 'react';

class MyPromise {
    state: string;
    value: string | undefined;
    reason: string | undefined;
    onFulfilledCallbacks: any[];
    onRejectedCallbacks: any[];
    constructor(executor: any) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value: string) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(callback => callback(this.value));
            }
        };

        const reject = (reason: string) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(callback => callback(this.reason));
            }
        };

        try {
            executor(resolve, reject);
        } catch (error: any) {
            reject(error);
        }
    }

    then(onFulfilled: any, onRejected: any) {
        if (this.state === 'fulfilled') {
            onFulfilled(this.value);
        } else if (this.state === 'rejected') {
            onRejected(this.reason);
        } else if (this.state === 'pending') {
            this.onFulfilledCallbacks.push(onFulfilled);
            this.onRejectedCallbacks.push(onRejected);
        }
    }
}

export default MyPromise;