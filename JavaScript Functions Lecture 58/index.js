function nice (name){
    console.log("Hay " +  name + " you are Good")
    console.log("Hay " +  name + " you are Nice")
    console.log("Hay " +  name + " you are Funny")
    console.log("Hay " +  name + " you are Perfect")
}

nice("Nasarullah")

nice("Herry")

// console.log("Hay Herry you are Good")
// console.log("Hay Herry you are Nice")
// console.log("Hay Herry you are Funny")
// console.log("Hay Herry you are Perfect")

// function sum(a,b){
//     // console.log(a+b)
//     return a + b
// }
// result1 = sum(11,9)
// result2 = sum(11,4)
// result3 = sum(10,8)

// console.log("Sum of a + b = ",result1)
// console.log("Sum of a + b = ",result2)
// console.log("Sum of a + b = ",result3)

function sum(a,b,c=10){
    return a+b+c
}
result1 = sum(5,5)
result2 = sum(11,4)
result3 = sum(10,8,2)

console.log("Sum of a + b + c = ",result1)
console.log("Sum of a + b + c = ",result2)
console.log("Sum of a + b + c = ",result3)

const func1 = (x)=> {
    console.log("I am an arrow function", x)
}

func1(34);
func1(66);
func1(84);