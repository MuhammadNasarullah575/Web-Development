const statements = ["Initializing Hacking",
    "Reading Your files",
    "Password files detected",
    "Sending all password and files to the server",
    "Cleaning Up"
]

let box = document.querySelector(".box");
let currentDots = null;

function sleep(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}


async function readStatements() {
    for (let i = 0; i < statements.length; i++) {

        if (currentDots) {
            currentDots.classList.remove("dots");
            currentDots.textContent = "....";
        }

        let h1 = document.createElement("h1");
        let span = document.createElement("span");

        h1.textContent = statements[i] + " ";

        span.classList.add("dots");

        box.append(h1);
        h1.append(span);

        currentDots = span;
        let randomTime = Math.ceil(Math.random() * 7000 + 1000);

        await sleep(randomTime);
    }

    currentDots.classList.remove("dots");
    currentDots.textContent = "....";
}

readStatements();