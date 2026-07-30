 let firstText = document.querySelector(".first-text");
        let inputLength = prompt("Enter array length");
        let input = document.querySelector(".input")
        let result = document.querySelector(".result");
        


        const addItems = async (element)=>{
            await randomTime();
            let h4 = document.createElement("h4");
            let Color = await randomColor();
            h4.style.color = Color;
            h4.textContent = element; 
            firstText.appendChild(h4);
        }

        const randomColor = () => {
          return new Promise((resolve) => {
            let rand1 = Math.floor(Math.random()*150);
            let rand2 = Math.floor(Math.random()*150);
            let rand3 = Math.floor(Math.random()*150);
            let rand = `rgb(${rand1}, ${rand2}, ${rand3})`

            resolve(rand);
            
          })
        }
        

        const randomTime = ()=>{
            return new Promise((resolve) => {
                let timeout = 100 + Math.random()*2000
              setTimeout(resolve,timeout);
            })
        }

        async function showText(){
           
                const arr = ["1. Hello guy! This is an array calculator!",
                    "2. This calculator calculate array only positive numbers",
                    "3. If any negative number found in array it will stop calculate array further and you can see only sum of positive numbers"
                ]
        
                for (const element of arr) {
                   await addItems(element);

                }


                let x = Number(inputLength);
                let arr2 = [];
                let sum = 0;

                for (let inputArray = 0; inputArray < x ; inputArray++) {
                    
                    let y = prompt("Enter Array");
                    arr2.push(Number(y));

                    
                }
                
                for (let i = 0; i < x; i++) {
                    if(arr2[i] < 0){
                        break;
                    }
                    sum += arr2[i];
                }

                input.innerHTML = `${arr2.join(", ")}`;

                result.innerHTML = `${sum}`;

        }

        showText();