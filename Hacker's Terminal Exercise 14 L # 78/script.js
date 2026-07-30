const statements = [

    "Initializing Hacking",
    "Reading Your Files",
    "Password Files Detected",
    "Sending all passwords and personal files to server",
    "Cleaning up"

];

const box = document.querySelector(".box");

let currentDots = null;


// Sleep Function
function sleep(time){

    return new Promise(resolve=>{

        setTimeout(resolve,time);

    });

}


// Main Function
async function startHack(){

    for(let i=0;i<statements.length;i++){

        // Previous dots stop
        if(currentDots){

            currentDots.classList.remove("dots");

            currentDots.textContent="....";

        }

        // Create h1
        let h1=document.createElement("h1");

        h1.textContent=statements[i]+" ";

        // Create span
        let span=document.createElement("span");

        span.classList.add("dots");

        h1.appendChild(span);

        box.appendChild(h1);

        currentDots=span;

        // Random 1-7 sec
        let randomTime=(Math.floor(Math.random()*7)+1)*1000;

        await sleep(randomTime);

    }

    // Last line ke dots bhi stop
    currentDots.classList.remove("dots");

    currentDots.textContent="....";

}

startHack();