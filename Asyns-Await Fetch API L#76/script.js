// async function getData(){
// return new Promise((resolve, reject)=>{
//     setTimeout(()=>{
//         resolve(455);
//     },5000)
// })
// }
async function getData(){
    let x = await fetch('https://jsonplaceholder.typicode.com/todos/1')
    let data = await x.json()
    return data;
}

// settle means resolve or rejected
// resolve means promise has setteled successfully
// reject means promise has not setteled successfully

// Synchronous = "Pehle ye kaam khatam karo, phir agla."
// Asynchronous = "Ye kaam shuru karo, tab tak doosre kaam bhi kar lo; jab ye complete hoga to uska result mil jayega."

async function main() {
    
    console.log("Loading Modules");
    
    
    console.log("Do something else");
    
    console.log("Load Data");
    let data = await getData();
    
    console.log(data)
    
    console.log("Process Data");
    
    console.log("Task 2");
}

main();

// Asynchonous bnany ka eik method following hai lakin yeh call back wala hi hisab ho jaata hai better approach yeh hi hai k function k sath async likh diya jaaye

// data.then((v)=>{

//     console.log(data)
    
//     console.log("Process Data");
    
//     console.log("Task 2");
// })



