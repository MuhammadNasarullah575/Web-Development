// Create a business name generator by combining list of adjectives and shop name and another word

// List of adjectives
// Crazy
// Amazing
// Fire



// shop name
// Engine
// Food
// Garments

// Another Words
// Bros
// Limited
// Hub

let result = document.getElementById("result");
let btn = document.querySelector(".btn")


let obj1 = {
    adj1: "Crazy",
    adj2: "Amazing",
    adj3: "Fire",
}

let obj2 = {
    shop1: "Engine",
    shop2: "Food",
    shop3: "Garments",
}

let obj3 = {
    word1: "Bros",
    word2: "Limited",
    word3: "Hub",
}

let key1 = Object.keys(obj1);
let randomIndex1 = Math.floor(Math.random() * key1.length);
// console.log(obj1[key1[randomIndex1]]);

let key2 = Object.keys(obj2);
let randomIndex2 = Math.floor(Math.random() * key2.length);
// console.log(obj2[key2[randomIndex2]]);

let key3 = Object.keys(obj3);
let randomIndex3 = Math.floor(Math.random() * key3.length);
// console.log(obj3[key3[randomIndex3]]);


let BusinessName = obj1[key1[randomIndex1]] + " " +
    obj2[key2[randomIndex2]] + " " +
    obj3[key3[randomIndex3]];


// console.log("Your Business Name is "+ obj1[key1[randomIndex1]]+ " " + obj2[key2[randomIndex2]]+ " " + obj3[key3[randomIndex3]]);



btn.addEventListener("click", function () {

    let key1 = Object.keys(obj1);
    let randomIndex1 = Math.floor(Math.random() * key1.length);
    // console.log(obj1[key1[randomIndex1]]);

    let key2 = Object.keys(obj2);
    let randomIndex2 = Math.floor(Math.random() * key2.length);
    // console.log(obj2[key2[randomIndex2]]);

    let key3 = Object.keys(obj3);
    let randomIndex3 = Math.floor(Math.random() * key3.length);
    // console.log(obj3[key3[randomIndex3]]);


    let BusinessName = obj1[key1[randomIndex1]] + " " +
        obj2[key2[randomIndex2]] + " " +
        obj3[key3[randomIndex3]];

    result.innerText = "Your Business name is " + BusinessName;
})
result.innerText = "Your Business name is " + BusinessName;


