import React, { useEffect } from 'react';
import MyPromise from './components/demo/MyPromise';
import FromList from './components/demo/FormList';
import './App.css';

function App() {

  useEffect(() => {
    const promise = new MyPromise((resolve: any, reject: any) => {
      setTimeout(() => {
        resolve('成功');
      }, 1000);
    });

    promise.then((value: any) => {
      console.log(value);
    }, (reason: any) => {
      console.log(reason);
    });
  }, []);

  return (
    <div className="App">
      <FromList />
    </div>
  );
}

export default App;
