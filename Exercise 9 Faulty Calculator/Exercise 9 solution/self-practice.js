let a = prompt("Enter First Number");
let b = prompt("Enter Second Number");
let c = prompt("Enter Operator");

let random = Math.random();

let obj = {
    "+" : "-",
    "*" : "+",
    "-" : "/",
    "/" : "**",
}

console.log(random);

if(random > 0.1){
    c = obj[c];
    alert(`Result of these two numbers are ${eval(`${a} ${c} ${b}`)}`)
}
else{
    alert(`Result of two numbers are ${eval(`${a} ${c} ${b}`)}`)
}