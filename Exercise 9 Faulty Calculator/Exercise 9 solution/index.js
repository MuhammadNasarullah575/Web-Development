let random = Math.random();
let a = prompt("Enter First number");
let b = prompt("Enter Second number");
let c = prompt("Enter Operation");

let obj = {
    "+" : "-",
    "*" : "+" ,
    "-" : "/" ,
    "/" : "**" ,

}

if(random>0.1){
    // Perform correct calculation
    alert(`The result is ${eval(`${a} ${c} ${b}`)}`)
}
else{
    // perform wrong calculation
    c = obj[c]
    alert(`The result is ${eval(`${a} ${c} ${b}`)}`)
}