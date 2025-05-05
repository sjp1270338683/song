// js（采取将双字节字符替换成"aa"的做法，取长度）
GetLength = function(str) { 
  return str.replace(/[^\x00-\xff]/g,"aa").length; 
}; 
GetLength = function(str) {
  var realLength = 0;
  for (var i = 0; i < str.length; i++) {
    charCode = str.charCodeAt(i); 
    if (charCode >= 0 && charCode <= 128) realLength += 1;
    else realLength += 2; 
  } 
  return realLength; 
}
// 数据传递
window.dispatchEvent(
  new CustomEvent('user.identity.get', {
    detail: {
    identity: findUserIdentity?.code,
    },
  }),
);
window.addEventListener(
  'user.identity.get',
  (data) => {
    if (data?.detail?.identity) {
    setIdentity(data.detail.identity);
    }
  },
  false,
);
// css 省略
p {
    width: 300px;
    overflow: hidden;
    /*文本不会换行*/
    white-space: nowrap;
    /*当文本溢出包含元素时，以省略号表示超出的文本*/
    text-overflow: ellipsis;
  }
p {
    width: 300px;
    overflow: hidden;
    /*将对象作为弹性伸缩盒子模型显示*/
    display: -webkit-box;
    /*设置子元素排列方式*/
    -webkit-box-orient: vertical;
    /*设置显示的行数，多出的部分会显示为...*/
    -webkit-line-clamp: 3;
  }
