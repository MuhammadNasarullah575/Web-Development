// 6 type of loops in javascript
// for loop
// for in loop 
// for of loop
// while loop 
// do while loop
// foreach


// manual method neechy likha howa 
let a = 0;
// console.log(a)
// console.log(a+1)
// console.log(a+2)
// console.log(a+3)
// console.log(a+4)
// console.log(a+5)
// console.log(a+6)

for (let i = 0; i<100; i++) {
    console.log(a + i)
}

let obj ={
    name: "Harry",
    role:  "programmer",
    company: "CodeWithHarry AI"
}

for (const key in obj) {
    const value = obj[key];
    console.log(key,value)
}

for (const c of "Harry Acha Banda hai ") {
    console.log(c)
}

// let i = 0;
// while(i<6){
//     console.log(i)
//     i++
// }

let i=0;
do{
    console.log(i)
    i++;
}
while(i<6)


