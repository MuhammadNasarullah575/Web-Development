function createCard(title, cName, views, monthsOld, duration, thumbnail ){
    let viewStr
    if (views<1000){
        viewStr = views/1000 + "K";
    }
    else if (views>100000){
        viewStr = views/1000000 + "M";
    }
    else{
        viewStr = views/1000 + "K";
    }
    let html = `<div class="card">
            <div class="image">
                <img src="${thumbnail}" alt="pic">
                <div class="capsule">${duration}</div>
            </div>
            <div class="text">
                <h1>${title}</h1>
                <p>${cName} . ${viewStr} views . ${monthsOld} months ago</p>
            </div>
        </div>`

    document.querySelector(".container").innerHTML = document.querySelector(".container").innerHTML + html;
}

createCard("Introduction to Backend | Sigma Web Dev video #2", "CodeWithHarry",560000, 7, "31:22", "https://i.ytimg.com/vi/BGeDBfCIqas/hqdefault.jpg?sqp=-oaymwEnCPYBEIoBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAOpE-jqfC5twD183Onwd0gRQ7mJQ")