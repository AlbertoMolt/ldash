const contextMenu = document.getElementById('contextMenu');
const editItemDialog = document.getElementById('editItemDialog');
const deleteItemDialog = document.getElementById('deleteItemDialog');


let currentMouseX = 0;
let currentMouseY = 0;

let itemid = 0;

// Mantener las coordenadas actualizadas
document.addEventListener('mousemove', function(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
});

//################################
//            DELETE
//################################
document.getElementById('deleteItemBtn').addEventListener('click', function(){
    deleteItemDialog.showModal();

    getItemData()
    .then(item => {
        deleteItemDialog.innerHTML = `
            <h2>Delete ${item.name}</h2>
            <p>Are you sure?<p>
            <button type="button" id="confirmDelete" onclick="deleteItem()">Yes</button>
            <button type="button" id="cancelDelete" onclick="cancelOperation()">Cancel</button>
        `
    })
    .catch(err => alert(err));
});

function deleteItem(){
    fetch(`/item/${itemid}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload()
        } else {
            alert('Error: ' + data.error);
        }
    })
}

//################################
//            EDIT
//################################
document.getElementById('editItemBtn').addEventListener('click', function(){
    editItemDialog.showModal();

    getItemData()
        .then(item => {
            editItemDialog.innerHTML = `
                <div class="edit-item-wrapper">
                    <h2>Edit ${item.name}</h2>
        
                    <label for="itemName">Name</label><br>
                    <input type="text" class="inputEdit" id="itemName" name="itemName" value="${item.name}"><br>
                    <br>
        
                    <label for="itemIcon">Icon</label><br>
                    <input type="text" class="inputEdit" id="itemIcon" name="itemIcon" value="${item.icon}"><br>
                    <div class="icon-wrapper">
                        <img src=${item.icon} id="iconPreview" width="30px">
                    </div>
                    <br>
        
                    <label for="itemUrl">Url</label><br>
                    <input type="url" class="inputEdit" id="itemUrl" name="itemUrl" value="${item.url}"><br>
                    <br>
        
                    <label for="itemCategory">Category</label><br>
                    <input type="text" class="inputEdit" id="itemCategory" name="itemCategory" value="${item.category}"><br>
                    <br>
                    
                    <label for="openingMethod">Opening method</label><br>
                    <select class="inputEdit" id="openingMethod" name="openingMethod">
                        <option value="true" ${item.tabType === 'true' ? 'selected' : ''}>New tab</option>
                        <option value="false" ${item.tabType === 'false' ? 'selected' : ''}>Same tab</option>
                    </select>
                </div>
                <button type="button" id="applyChangesBtn" onclick="applyChanges()">Apply</button>
                <button type="button" id="cancelChangesBtn" onclick="cancelOperation()">Cancel</button>
            `;
        
            const itemIconInput = document.getElementById('itemIcon')
            const iconPreview = document.getElementById('iconPreview')
        
            itemIconInput.addEventListener('input', () => {
                console.log(itemIconInput.value);
                iconPreview.src = itemIconInput.value;
            });
        })
        .catch(err => alert(err));
});

function applyChanges(){
    if (itemid != 0) {
        fetch(`/item/${itemid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: document.getElementById('itemName').value,
                icon: document.getElementById('itemIcon').value,
                url: document.getElementById('itemUrl').value,
                category: document.getElementById('itemCategory').value,
                tab_type: document.getElementById('openingMethod').value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload(); // Recargar página
            } else {
                alert('Error: ' + data.error);
            }
        });
    } else {
        console.error("ID item undefined")
    }
}

//################################
//       GENERAL FUNCTIONS
//################################
function getItemData() {
    return fetch(`/item/${itemid}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return {
                name: data.name,
                icon: data.icon,
                url: data.url,
                category: data.category,
                tabType: data.tab_type
            };
        } else {
            throw new Error(data.error);
        }
    });
}

function cancelOperation() {
    //Edit dialog
    editItemDialog.innerHTML = `
        <p>Loading...</p>
    `
    editItemDialog.close();

    //Delete dialog
    deleteItemDialog.innerHTML = `
        <p>Loading...</p>
    `
    deleteItemDialog.close();

}
//---------------------------------

document.addEventListener("contextmenu", function(event) {
    try {
        let item_selected = event.target.closest("div[itemid]").getAttribute("itemid");
        
        if (item_selected) {
            event.preventDefault();
            console.log("id item selected: ", item_selected);

            itemid = item_selected

            contextMenu.style.display = 'block';
            contextMenu.style.top = currentMouseY + 'px';
            contextMenu.style.left = currentMouseX + 'px';
        }
    } catch (error) {}
});

document.addEventListener("click", function(event) {
    // Verifica si el click fue dentro del menú contextual y en los botones
    if (!event.target.closest('#contextMenu') || event.target.closest('#toolbox')) {
        contextMenu.style.display = "none";
    }
});
