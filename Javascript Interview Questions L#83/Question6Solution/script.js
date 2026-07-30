let textArea = document.querySelector(".textArea");
let calculate = document.querySelector(".calculate");
let result = document.querySelector(".result");

let a = prompt("Enter paragraph");

textArea.innerHTML = a;

let x = textArea.innerHTML;
let count = 0;

calculate.addEventListener("click", () => {
    for (let i = 0; i <= x.length; i++) {
        let y = x[i];

        if (y === 'a' || y === 'e' || y === 'i' || y === 'o' || y === 'u' || y === 'A' || y === 'E' || y === 'I' || y === 'O' || y === 'U') {

            count += 1;
        }
    }

    result.innerHTML = `Length of vowel [a,e,i,o,u] is ${count}`;
})

