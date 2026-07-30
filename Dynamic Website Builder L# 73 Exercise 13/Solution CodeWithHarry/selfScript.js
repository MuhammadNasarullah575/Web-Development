function createCard(title, views, duration, time, thumbnail){
    let html = ` <div class="cards">
            <div class="image">
                <img src="${thumbnail}" alt="pic">

                <div class="time">${time}</div>
            </div>
            <div class="title">
                <h2>${title}</h2>
                <p>${views} views . ${duration} Years ago</p>
            </div>
            
        </div>`

        document.querySelector(".container").innerHTML = document.querySelector(".container").innerHTML + html;
}

createCard("Code With Harry Code With Harry", "5M", "5", "50:40", "https://i.ytimg.com/vi/BGeDBfCIqas/hqdefault.jpg?sqp=-oaymwEmCMQBEG5IWvKriqkDGQgBFQAAiEIYAdgBAeIBCggYEAIYBjgBQAE=&rs=AOn4CLAgeFVTsTa50d_bY9Z48wIwS-3OKA");