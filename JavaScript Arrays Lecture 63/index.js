let arr = [1,2,4,5,7];

// arr[0] = 5666;

// console.log(typeof arr);
// console.log(arr);
// console.log(arr.length);
// console.log(arr[0]);
// console.log(arr[2]);
// console.log(arr[4]);

console.log(arr.toString());
console.log(arr.join(" and "));

// arr.pop();  Aakhri element ko pop karta array mein
// console.log(arr);

// arr.push(100); push last element ko remove karta hai
// console.log(arr);

// arr.push("Nasir");
// console.log(arr);

// arr.shift();    // Array mein First element ko remove karta hai 
// console.log(arr);

// arr.unshift("Ameer");
// console.log(arr);

// delete arr[0];
// console.log(arr);

// arr[0] = 15;

let arr2 = [2,4,6];
let arr3 = [3,5,9];

arr = arr.concat(arr2,arr3);
console.log(arr);

arr.sort();
console.log(arr);

// Splice original array mein changing kar sakti hai lakin slice k case mein eik variable bnana parta jis mein new result save hota hai

let numbers = [1,2,3,4,5];
console.log(numbers);
// numbers.splice(1,2); // index one sy onward two element ghaib karny k liye use hota 
// console.log(numbers);
numbers.splice(1,3,14,15,16);
console.log(numbers);

const num = [1,2,3,4,5,6,7,8,9,10];
console.log(num);
let result = num.slice(2);
console.log(result);

let result1 =  num.slice(1,10);
console.log(result1);


