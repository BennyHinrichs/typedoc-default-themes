namespace typedoc {

  export const throttle = (fn:Function, wait = 100) => {
    let time = Date.now();
    return function(...args:any) {
      if ((time + wait - Date.now()) < 0) {
        fn.call(args);
        time = Date.now();
      }
    }
  }
  
}