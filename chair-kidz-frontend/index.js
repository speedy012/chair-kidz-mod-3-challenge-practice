const allKidsLink = `http://localhost:3000/api/v1/kids`
const chairKidLink = `http://localhost:3000/api/v1/kids/chair`
const voteKidLink = `http://localhost:3000/api/v1/kids/vote`
const throneKidLink = `http://localhost:3000/api/v1/kids/throne`

//your code here
const kids = document.querySelector("#kid-options")
const addKidBtn = document.querySelector("#add-kid")
const chairCont = document.querySelector("#chairs-container")

function allKids() {
  fetch(allKidsLink)
  .then(function(resp){
    return resp.json();
    })
  .then(function(kidsList){
    chairCont.innerHTML = ``
    kids.innerHTML = ``
    kidsList.data.forEach(kid =>{
      if (kid.attributes['in-chair'] == true) {
        chairCont.innerHTML += `
        <div id =${kid.id}-container class="kid-chair-container">
        <img class="image" src="${kid.attributes["img-url"]}">
        <br>
        <br>
        <div data-id=${kid.id} data-vote=${kid.attributes.votes} class="attribute">
        ${kid.attributes.name}
        <br>
        Score: ${kid.attributes.votes}
        <br>
        <a class="vote-down" href="#">Vote Down</a> | <a class="vote-up" href="#">Vote Up</a>
        <br>
        <a class="hide" href="#">Hide</a>
        </div>
        </div>
        `
      } else {
        kids.innerHTML += `
        <option value=${kid.id}>${kid.attributes.name}</option>
        `
      }
    })
  })
}

addKidBtn.addEventListener('click', function(event){

  fetch(chairKidLink,{
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      kid_id: kids.options[kids.selectedIndex].value
    })
  })
  .then(response => response.json())
  .then(parsedData => parsedData.data)
  .then(selectedKid => {
    // debugger
    allKids();
  })
})

chairCont.addEventListener("click", function (e) {
  e.preventDefault();
  console.log(e)
  // console.log(e.target.parentElement.dataset.id);
  // console.log(e)
  if (e.target.className === "vote-up") {
    fetch(voteKidLink, {
      method: "PATCH",
      headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
      },
      body: JSON.stringify({
        kid_id: e.target.parentElement.dataset.id,
        vote: "up"
      })
    }).then(allKids)
  }
  else if (e.target.className === "vote-down") {
    if (e.target.parentElement.dataset.vote < -4){
      fetch(allKidsLink, {
        method: "DELETE",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify({
          kid_id: e.target.parentElement.dataset.id
        })

    }).then(allKids)
    // .then(resp => resp.json())
    // .then(console.log)
    } else {
    fetch(voteKidLink, {
      method: "PATCH",
      headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
      },
      body: JSON.stringify({
        kid_id: e.target.parentElement.dataset.id,
        vote: "down"
      })
    })
    .then(allKids)
    }
  }
  // else if (e.target.className === "hide") {
  //   fetch(chairKidLink, {
  //     method: "PATCH",
  //     headers: {
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       kid_id: e.target.parentElement.dataset.id,
  //       in_chair: false
  //     })
  //   }).then(allKids)
  // }
})

allKids();
