let Input = document.querySelector("input");
let Button = document.querySelector(".btn");
let display = document.querySelector(".factorial-result");
let popup = document.querySelector(".pop-up-message");
let close = document.querySelector(".cross");
let ok = document.querySelector(".ok");
let cancel = document.querySelector(".cancel");

Button.addEventListener("click", function(){
   let x = Number(Input.value);

   let arr = Array.from({length:x}, (_,i)=>i + 1);

   let factorial = arr.reduce((a,b) =>{
    return a*b;
   })

   display.innerText = `Factorial of ${x} is ${factorial}`;

   popup.style.display = "block";
})

close.addEventListener("click", function(){
   popup.style.display = "none";
})

ok.addEventListener("click", function(){
   popup.style.display = "none";
})

cancel.addEventListener("click", function(){
   popup.style.display = "none";
})

