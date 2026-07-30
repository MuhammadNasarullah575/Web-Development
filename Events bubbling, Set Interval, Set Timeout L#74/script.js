let button = document.getElementById("btn");
 
// button.addEventListener("click", ()=>{
//     document.querySelector(".box").innerHTML = "<b>Haaa! You were clicked</b> Enjoy your clicked";
// })


// button.addEventListener("dblclick", ()=>{
//     document.querySelector(".box").innerHTML = "<b>Haaa! You were clicked</b> Enjoy your clicked";
// })

// button.addEventListener("contextmenu", ()=>{
//     alert("Don't hack us by Right Click Please");
// })
document.addEventListener("keydown", (e)=>{
    // console.log(e);  //jo key bi press karain gy uski detail btay ga
    console.log(e.key,e.keyCode);  // key + key code
})