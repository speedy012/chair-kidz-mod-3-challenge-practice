let kids = []

let allKidsLink = `http://localhost:3000/api/v1/kids`
let chairKidLink = `http://localhost:3000/api/v1/kids/chair`
let voteKidLink = `http://localhost:3000/api/v1/kids/vote`
let throneKidLink = `http://localhost:3000/api/v1/kids/throne`

let chairsContainer = document.getElementById("chairs-container")
let addKidContainer = document.getElementById("add-kid-container")
let options = document.getElementById("kid-options")
let addButton = document.getElementById("add-kid")
let defaultOption = document.getElementById("default-option")
let createButton = document.getElementById("create-kid")
let nameInput = document.getElementById("new-name")
let imgInput = document.getElementById("new-image")
let throne = document.getElementById("throne")

fetch(allKidsLink)
  .then(res => res.json())
  .then(res => kids = res.data)
  .then(placeKids)

  addButton.addEventListener('click', function(e){
    e.preventDefault()
    fetch(chairKidLink, {
      method: "PATCH",
      headers: {
           "Content-Type": "application/json",
           "Accept": "application/json"
       },
      body: JSON.stringify({
        kid_id: parseInt(options.value)
      })
    })
    let kid = kids.find(kid => kid.id == parseInt(options.value))
    kid.attributes['in-chair'] = true
    placeKids()
    addButton.selectedIndex = 0
  })

  createButton.addEventListener('click', function(e){
    fetch(allKidsLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        kid: {
          name: nameInput.value,
          img_url: imgInput.value
        }
      })
    })
    .then(res => res.json())
    .then(res => {
      kids.push(res.data)
    })
    .then(placeKids)
  })

  chairsContainer.addEventListener('click', function(e){
    if (e.target.className == "hide") {
      e.preventDefault()
      let kid = kids.find(kid => kid.id == parseInt(e.target.parentElement.dataset.id))
      console.log(kid);
      fetch(chairKidLink, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          kid_id: parseInt(kid.id),
        })
      })
      kid.attributes['in-chair'] = false
      placeKids()
    }

    if (e.target.className == "vote-down") {
      e.preventDefault()
      let kid = kids.find(kid => kid.id == parseInt(e.target.parentElement.dataset.id))
      kid.attributes['votes'] -= 1
      if (kid.attributes.votes > -5) {
        fetch(voteKidLink, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            kid_id: parseInt(e.target.parentElement.dataset.id),
            vote: "down"
          })
        })
      } else if (kid.attributes.votes == -5){
        fetch(allKidsLink, {
          method: "DELETE",
          headers: {
               "Content-Type": "application/json",
               "Accept": "application/json"
           },
          body: JSON.stringify({
            kid_id: parseInt(kid.id)
          })
        })
        console.log(kid);
        kids = kids.filter(safe => safe.id != kid.id)
        console.log(kids);
      }
      placeKids()
    }

    else if (e.target.className == "vote-up") {
      e.preventDefault()
      let kid = kids.find(kid => kid.id == parseInt(e.target.parentElement.dataset.id))

      kid.attributes.votes += 1

      if (kid.attributes.votes < 5) {
        fetch(voteKidLink, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            kid_id: parseInt(kid.id),
            vote: "up"
          })
        })
      }

      else if (kid.attributes.votes == 5) {
        current_throne = kids.find(kid => kid.attributes.throne == true)
        current_throne ? current_throne.attributes.throne = false : null

        kid.attributes.votes = 0
        kid.attributes.throne = true
        fetch(throneKidLink, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          kid_id: parseInt(kid.id),
        })
      })
    }
      placeKids()
    }
  })

  function setButton(set){
    switch (set){
       case "inactive":
        addButton.disabled = true
        options.options[0].text = "No kids left"
        break ;
      case "active":
        addButton.disabled = false
        options.options[0].text = "Put a kid in a chair"
    }

  }

  function placeKids(){
    options.innerHTML = `<option id="default-option" value="" disabled selected hidden></option>`
    chairsContainer.innerHTML = ``
    //don't need to pass in the argument of the kids array because it's available within the scope
    kids.forEach(kid => {
      if (kid.attributes.throne) {
        throne.innerHTML = `<img class="image" src=${kid.attributes['img-url']} /><p>${kid.attributes.name}</p>`
      }
      else if (kid.attributes['in-chair']){
        chairsContainer.innerHTML += `
          <div id=${kid.id}-container class="kid-chair-container">
            <img class="image" src=${kid.attributes['img-url']} />
            <br>
            <br>
            <div data-id=${kid.id} class="attribute">
            ${kid.attributes.name}
            <br>
            Score: ${kid.attributes.votes}
            <br>
            <a class="vote-down" href="#">Vote Down</a> | <a class="vote-up" href="#">Vote Up</a>
            <br>
            <a class="hide" href="#">Hide</a>
            </div>
          </div>`
      }
      else {
        options.innerHTML += `<option value=${kid.id}>${kid.attributes.name}</option>`
      }
      kids.filter(kid => kid.attributes['in-chair'] == true).length ==  0 ? chairsContainer.innerHTML = `THERE ARE NO KIDS IN CHAIRS YET` : null
      kids.filter(kid => kid.attributes['in-chair'] == false).length == 0 ? setButton("inactive") : setButton("active")
    })
  }
