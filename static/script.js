const contextMenu = document.getElementById('contextMenu');
const editItemDialog = document.getElementById('editItemDialog');


let currentMouseX = 0;
let currentMouseY = 0;

<<<<<<< HEAD
let itemid = 0;

=======
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
// Mantener las coordenadas actualizadas
document.addEventListener('mousemove', function(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
});

function getMousePos() {
    console.log('X: ' + currentMouseX + ', Y: ' + currentMouseY);
    
    contextMenu.style.display = 'block';
    contextMenu.style.top = currentMouseY + 'px';
    contextMenu.style.left = currentMouseX + 'px';
}


document.getElementById('editItem').addEventListener('click', function(){
    editItemDialog.showModal();

<<<<<<< HEAD

    fetch(`/item/${itemid}`, {  // aquí el ID va en la URL
        method: 'GET',             // usamos GET porque solo queremos obtener datos
        headers: {'Content-Type': 'application/json'}
    })

    .then(response => response.json())
    .then(data => {
        if (data.success) {
            
        } else {
            alert('Error: ' + data.error);
        }
    });

=======
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
    dialogContent = `
        <input type="text" id="itemName" name="Item name" value=""><br>
        <input type="text" id="itemIcon" name="Item icon" value=""><br>
        <input type="url" id="itemUrl" name="Item url" value=""><br>
        <input type="text" id="itemUrl" name="Item category" value=""><br>

        <select id="openingMethod" name="Opening method">
            <option value="true">New tab</option>
            <option value="false">Same tab</option>
        </select>
    `;

    editItemDialog.innerHTML = dialogContent

<<<<<<< HEAD

=======
    console.log("Hola")
    fetch('/edit_item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: })
    })

    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Recarga la página
        } else {
            alert('Error: ' + data.error);
        }
    });
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
})


document.addEventListener("contextmenu", function(event) {
    try {
        let item_selected = event.target.closest("div[itemid]").getAttribute("itemid");
        
        if (item_selected) {
            event.preventDefault();
            console.log("id item selected: ", item_selected);
<<<<<<< HEAD
            itemid = item_selected
=======
>>>>>>> 6bb3e6e (Implement database monitoring and CRUD operations with Flask; add context menu for item editing and deletion)
            getMousePos()
        }
    } catch (error) {}
});

document.addEventListener("click", function(event) {
    // Verifica si el click fue dentro del menú contextual y en los botones
    if (!event.target.closest('#contextMenu') || event.target.closest('#toolbox')) {
        contextMenu.style.display = "none";
    }
});
