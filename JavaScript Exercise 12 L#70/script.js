let x = document.getElementsByClassName("box");

console.log(x);

x[0].style.backgroundColor = "red";
x[1].style.backgroundColor = "blue";
x[2].style.backgroundColor = "green";
x[3].style.backgroundColor = "yellow";
x[4].style.backgroundColor = "orange";

document.querySelectorAll(".box").forEach(e => {
    e.style.color = "white";
});