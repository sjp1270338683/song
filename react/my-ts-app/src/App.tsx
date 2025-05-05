/**
 * @name 主页组件
 * @time 2024-11-11
 * @author jixianda.jxd
 */
import { useRef } from 'react';

export default function Home() {
  

  return (
   <div>123</div>
  );
}

var a = 1;
function fn1() {
  console.log(a);
}

function fn2() {
  var a = 2;
  fn1();
}

fn2(); 