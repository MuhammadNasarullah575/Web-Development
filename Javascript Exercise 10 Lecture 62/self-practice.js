let result = document.getElementById("result");
let button = document.querySelector(".btn");


obj1 = {
    adj1: "Crazy",
    adj2: "Amazing",
    adj3: "Fire",
}

obj2 = {
    shop1: "Engine",
    shop2: "Food",
    shop3: "Garments",
}

obj3 = {
    word1: "Bros",
    word2: "Limited",
    word3: "Hub",
}

let key1 = Object.keys(obj1);
let randomIndex1 = Math.floor(Math.random() * key1.length);

let key2 = Object.keys(obj2);
let randomIndex2 = Math.floor(Math.random() * key2.length);

let key3 = Object.keys(obj3);
let randomIndex3 = Math.floor(Math.random() * key3.length);

let x = obj1[key1[randomIndex1]] + " " + obj2[key2[randomIndex2]] + " " + obj3[key3[randomIndex3]];

result.innerText = "Your Business name is " + x;

button.addEventListener("click", function () {

    let key1 = Object.keys(obj1);
    let randomIndex1 = Math.floor(Math.random() * key1.length);

    let key2 = Object.keys(obj2);
    let randomIndex2 = Math.floor(Math.random() * key2.length);

    let key3 = Object.keys(obj3);
    let randomIndex3 = Math.floor(Math.random() * key3.length);

    let x = obj1[key1[randomIndex1]] + " " + obj2[key2[randomIndex2]] + " " + obj3[key3[randomIndex3]];

    result.innerText = "Your Business name is " + x;
})



