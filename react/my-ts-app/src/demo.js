function get(
    obj: Record<string, any>,
    path: string | Record<string, string>,
    defaultValue: any | Record<string, any> ) {
}

// eg:
var user = {
  sex: 0,
  name: 'bytedance',
  age: 18,
  height: 180
  other: {
      country: 'China'
  }
}

get({}, 'name', 'unknown'); // unknown
get(user, 'name', 'unknown'); // bytedance

function get(
    obj: Record<string, any>,
    path: string | Record<string, string>,
    defaultValue: any | Record<string, any> ) {
        
}