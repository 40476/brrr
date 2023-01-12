window.addEventListener("load", async function() {
  // wait for the window to load
  
// var username=prompt('s')
  if (false) {

  } else {
    const colorSelect = document.createElement("div");
    colorSelect.classList.add("colorSelect");

    const colorSelectText = document.createElement("p");
    colorSelectText.innerHTML = "Please select a color for your username:"
    
    const doneButton = document.createElement("button");
    doneButton.innerHTML = "Done";

    function setDoneBtnDisabled() {
      doneButton.disabled = !document.querySelector(".colorInput:checked");
    }
    
    const colorOptions = document.createElement("div");
    colorOptions.classList.add("colorOptions");

    const availableColors = [
      { name: "Yellow", keyword: "yellow" },
      { name: "Orange", keyword: "orange" },
      { name: "Red", keyword: "red" },
      { name: "Pink", keyword: "pink" },
      { name: "Sky Blue", keyword: "skyblue" },
      { name: "Cadet Blue", keyword: "cadetblue" },
      { name: "Purple", keyword: "purple" }
    ];
    
    for (const color of availableColors) {
      const colorOption = document.createElement("div");
      colorOption.classList.add("colorOption");
      
      const colorInput = document.createElement("input");
      colorInput.classList.add("colorInput");
      colorInput.type = "radio";
      colorInput.name = "color";
      colorInput.id = color.keyword;
      colorInput.value = color.keyword;
      colorInput.style["background-color"] = color.keyword;
      colorInput.style["box-shadow"] = `0 0 10px ${color.keyword}`;

      colorInput.addEventListener("input", setDoneBtnDisabled);
      
      const colorLabel = document.createElement("label");
      colorLabel.setAttribute("for", colorInput.id);
      colorLabel.innerHTML = color.name;
      
      colorOption.append(colorInput, colorLabel);

      colorOptions.append(colorOption);
    }

    colorSelect.append(colorSelectText, colorOptions, doneButton);

    setDoneBtnDisabled();
    
    document.body.append(colorSelect);
    
    doneButton.onclick = function() {
      colorSelect.remove();
      
      document.body.dataset.playing = true;

      const selectedColor = colorSelect.querySelector(".colorInput:checked")?.value;

      if (!selectedColor) return;
      
      const socket = io(`wss://${window.location.host}/?color=${selectedColor}`);
  
      let curPlr;
      
      document.onmousemove = function(e) {
        if (curPlr) {
          curPlr.style.top = (e.clientY - 16) + "px"
          curPlr.style.left = (e.clientX - 16) + "px"
        }
        socket.emit("move", e.clientX / window.innerWidth, e.clientY / window.innerHeight)
      }
    
      document.onmousedown = function(e) {
        e.preventDefault();
        if (curPlr) {
          curPlr.style.borderRadius = "8px"
        }
        socket.emit("mouseDown")
      }
    
      document.onmouseup = function() {
        if (curPlr) {
          curPlr.style.borderRadius = "50vmax"
        }
        socket.emit("mouseUp")
      }
    
      function createChar(index, isMe, color, username, profileImage) {
        const newElem = document.createElement("div")
        newElem.classList.add("char", "other");
        if (isMe) newElem.classList.add("me");
        newElem.id = index
  
        newElem.style["background-image"] = `url("${profileImage}")`;
        
        const newElemName = document.createElement("div");
        newElemName.classList.add("plrUsername");
        newElemName.style.color = color;
        newElemName.innerText = isMe ? "You" : username;
  
        newElem.append(newElemName);
        
        document.body.appendChild(newElem)
  
        return newElem
      }
    
      socket.on("playerJoin", (isMe, index, user) => {
        const created = createChar(index, isMe, user.color, user.username, user.profileImage);
        if (isMe) curPlr = created;
      })
    
      socket.on("playerLeave", (index) => {
        document.getElementById(index.toString()).remove()
      })
    
      socket.on("playerMove", (index, ratioX, ratioY) => {
        const setPlayer = document.getElementById(index.toString())
        setPlayer.style.top = (ratioY * window.innerHeight) + "px"
        setPlayer.style.left = (ratioX * window.innerWidth) + "px"
      })
    
      socket.on("playerMouseDown", (index) => {
        document.getElementById(index.toString()).style.borderRadius = "8px"
      })
    
      socket.on("playerMouseUp", (index) => {
        document.getElementById(index.toString()).style.borderRadius = "50vmax"
      })
    }
  }
})