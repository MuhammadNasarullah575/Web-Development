console.log("Hello I am conditional tutorial")

let age = 1;
let grace = 4;


// age += grace
console.log(age + grace)
console.log(age - grace)
console.log(age * grace)
console.log(age / grace)
console.log(age ** grace)
console.log(age % grace)

// if((age + grace) > 18){
//     console.log("You can drive");
// }
// else{
//     console.log("You cannot drive");
// }

// if(age != 18){
//     console.log("You cannot drive")
// }
// else{
//     console.log("You can drive")
// }

if(age == 18){
    console.log("You can drive")
}
else if(age == 0){
    console.log("Are you kidding?")
}
else if(age == 1){
    console.log("Are you again kidding?")
}
else{
    console.log("You cannot drive")
}

a = 6;
b = 8;

// if else ki condition ko single line mein likhna ho to uska following method hai yahan par question mark ka matlab if hai is line 

// if(a>b){
//     let c = a-b;
// }
// else{
//     let c = a+b;
// }
let c = a>b ? (a-b) : (a+b);

