console.log("Nasir is a Hacker")
console.log("Aslam is a Hecker")

// Javascript asynchronous in nature hai

setTimeout(()=>{
    console.log("I am inside set Timeout")
},0);


setTimeout(()=>{
    console.log("I am inside set Timeout 2")
},0);

console.log("The End");


const fn = () => {
  console.log("Nothing");
}

const callback = (arg, fn) => {
  console.log(arg);
  fn();
}

const loadScript =  (src, callback)=>{
    let sc =  document.createElement("script");
    sc.src = src;
    sc.onload = callback("Ahmad Saeed Brand",fn);
    document.head.append(sc);
}

loadScript("https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/prism.min.js",callback)