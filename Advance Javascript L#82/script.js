async function sleep(){
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        resolve(45);
      },1000);
    }
    )
}

// Immedialely Invoke Function Expression (IIFE) yeh sara uska syntax hai
// (async function main(){
//     let a = await sleep();
//     console.log(a);
//     let b = await sleep();
//     console.log(b);
// })()

// Destructuring ka concept neechy diya gya hai

// (async function main(){
//     // let a = await sleep();
//     // console.log(a);
//     // let b = await sleep();
//     // console.log(b);

//     let [x,y,...rest] = [1,5,7,8,9,10,22,121]  // yeh destructing hai
//     console.log(x,y,rest);
// })()


// Constructing ka concept neechy hai
// (async function main(){
//     let obj = {
//         a:1,
//         b:2,
//         c:3
//     }

//     let {a,b} = obj;
//     console.log(a,b)
// })()


console.log(z);
// Spread Syntax
function sum(a,b,c){
    return a+b+c;
}

(async function main(){
    let obj = {
        a:1,
        b:2,
        c:3
    }

    let {a,b} = obj;
    console.log(a,b)

    let arr = [1,4,6];

// Neechy jo two lines likhi hoi hain inka meaning same hai
    console.log(sum(arr[0], arr[1] ,arr[2]))
    console.log(sum(...arr)) // Isko basically spread operator bolty hain
})()

var z = 1000;


//  Hoisting kiya hota?
// Basically code mein oper variable declare hota hai r neechy variable ki actual value hoti hai... variable undefine rehta hai lakin code mein error ni aata. For example:
// console.log(a)
// code
// code
// code
// code
// code
// var a =10 
// ab a ki value neechy aasign ki gai a khud oper hai to yeh undefined hi rahy ga.     hoisting sirf var m3ein hoti hai