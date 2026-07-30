let Display = document.getElementById("display");
let Buttons = document.querySelectorAll(".btn");

let text = "";

Buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {

        let value = btn.innerText;

        if (value == "C") {
            text = "";
            display.innerText = "";
        }
        else if (value == "X") {
            text = text.slice(0, -1);
            display.innerText = text;
        }
        else if (value == "=") {
            let answer = text;

            answer = answer.replaceAll("x", "*");
            answer = answer.replaceAll("÷", "/");
            answer = answer.replaceAll("%", "/100");

            let random = Math.random();

            if(random<0.1){
                let obj = {
                    "+": "-",
                    "*": "+",
                    "-": "/",
                    "/": "**",
                }

                for( let key in obj){
                    if(answer.includes(key)){
                        answer = answer.replace(key,obj[key]);
                        break;
                    }
                }
            }

            let result = eval(answer);
            text = result;
            display.innerText = text;
        }
        else {
            text = text + value;
            display.innerText = text;
        }
    })
})