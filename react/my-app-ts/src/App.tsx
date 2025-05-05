import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [str, setStr] = useState('');


  const onHandle = () => {
    console.log('结果：', demo());
  };
  
  const onChange = (e: any) => {
    setStr(e.target.value);
  };

  const demo = () => {
    let arr = [] as any;
    let newMap = {
      '{': '}',
      '[': ']',
      '(': ')',
    } as any;

    for(let i of str) {
      if(i in newMap) {
        arr.push(i);
      }else if(i === '}' || i === ']' || i ===')') {
        const last = arr.pop();
        if(newMap[last] !== i) {
          return false;
        }
      }
    }
    return arr.length === 0;
  }

  return (
    <div className="App">
      <input type="text" value={str} onChange={onChange} />
      <button onClick={onHandle}>查看</button>
    </div>
  );
}

export default App;
