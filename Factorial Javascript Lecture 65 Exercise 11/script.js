let Input = document.querySelector("input");

let Button = document.querySelector(".btn");

Button.addEventListener("click", function(){

    let x = Number(Input.value);
    let factorial = 1;

    for(let i=1; i<=x ; i++ ){
        factorial = factorial*i;
    }


    console.log(factorial);
    alert("Factorial of " + x + "  is " + factorial);
});