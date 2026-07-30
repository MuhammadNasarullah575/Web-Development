// let obj = {
//     a:1,
//     b:"Harry"
// }

// console.log(obj);

// let animal = {
//     eats: true
// };

// let rabbit = {
//     jumps : true
// }

// rabbit.__proto__ = animal;

class Animal{
    constructor(name){
        this.name = name;
        console.log("Ojbect is cerated...")
    }
    
    eats(){
        console.log("Who are You? Nobody give me instructions.")
    }
    
    jumps(){
        console.log("I shall defeat everybody")
    }
}

let a = new Animal("Bunny");
console.log(a);

class Lion extends Animal{
    constructor(name){
        super();
        this.name = name;
        console.log("Ojbect is cerated and he is a lion...")
    }

    eats(){
        console.log("Badmash hon mein")
    }

}

let l = new Lion("Shera");
console.log(l);
