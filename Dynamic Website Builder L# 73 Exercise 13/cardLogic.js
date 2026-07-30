let container = document.querySelector(".container");
let firstCard = document.querySelector(".card");

function createCard() {
    
    let imgLink = prompt("Enter the link of thumbnail image");
    let videoTitle = prompt("Enter the title of video");
    let NoOfViews = prompt("Enter number of views");
    let Duration = prompt("Enter number of days after uploading");
    
    let newCard = firstCard.cloneNode(true);


    //let thumbnail = document.querySelector(".thumbnail");
    newCard.querySelector(".thumbnail").innerHTML = `<img src = "${imgLink}" alt = "Thumbnail">`;

    //let title = document.querySelector(".title");
    newCard.querySelector(".title").innerHTML = `<h4>${videoTitle}</h4>`;

   // let numviews = document.querySelector(".numviews");
    let x = Number(NoOfViews);

    if(x >= 1000 && x<1000000){
        let view1 = (x/1000).toFixed(2);
        NoOfViews = `${view1}K views`;
    }
    else if(x >= 1000000){
        let view2 = (x/1000000).toFixed(2);
        NoOfViews = `${view2}M views`;
    }
    else{
        NoOfViews = `${NoOfViews} views`;
    }

    newCard.querySelector(".numviews").innerText = NoOfViews;

    //let duration = document.querySelector(".duration");
    let a = Number(Duration);

    if(a==1 || a==0){
        Duration = `${a} day ago`;
    }
    else if(a>1 && a<30){
        Duration = `${a} days ago`;
    }
    else if(a==30){
        let month = (a/30);
        Duration = `${a} month ago`;
    }
    else if(a>30 && a<360){
        let month1 = (a/30).toFixed(0);
        Duration = `${month1} months ago`
    }
    else if(a==360){
        let year1 = (a/360);
        Duration = `${year1} year ago`;
    }
    else{
        let year2 = (a/360).toFixed(1);
        Duration = `${year2} years ago`;
    }

    newCard.querySelector(".duration").innerText = Duration;




    
    container.append(newCard); 
}
createCard();
createCard();
// createCard();
// createCard();
// createCard();
// createCard();
// createCard();
// createCard();
// createCard();
// createCard();
// createCard();
// createCard();
firstCard.remove();