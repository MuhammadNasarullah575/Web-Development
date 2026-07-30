let a = 5;
function Factorial(number){
    let fact = 1;
    for (let index = 1; index <= number; index++) {
        fact = fact*index;
        
    }

    return fact;
}

Factorial(a);
console.log(Factorial(a));