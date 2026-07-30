let a = prompt("Enter First number")

let b = prompt("Enter second number")

if (isNaN(a) || isNaN(b)) {
    throw SyntaxError("Sorry Alphabets or special characters are not allowed");
}

let sum = parseInt(a) + parseInt(b);  // jab hum promp use kar rahy hoty tab hum parseInt 

function main() {
    let x = 1
    try {
        console.log("Sum of these two numbers are ", sum * x);
        return true;
    } catch (error) {
        console.log("There is some error")
        return false;
    }

    // Normally jab bi koi value return hoti hai to us k baad code ni chalta lakin jab hum finally use karty to yeh return k baad bi code ko execute karta hai
    finally {
        console.log("Files are being closed and db connection is being closed")
    }
}

let c = main()
