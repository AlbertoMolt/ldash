const contextMenu = document.getElementById('contextMenu');
const deleteItemDialog = document.getElementById('deleteItemDialog');
const editItemDialog = document.getElementById('editItemDialog');
const createItemDialog = document.getElementById('createItemDialog');


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
        
                    <label for="itemNameEdit">Name</label><br>
                    <input type="text" id="itemNameEdit" name="itemNameEdit" value="${item.name}"><br>
                    <br>
        
                    <label for="itemIconEdit">Icon</label><br>
                    <input type="text" id="itemIconEdit" name="itemIconEdit" value="${item.icon}"><br>
                    <div class="icon-preview-container">
                        <img src=${item.icon} id="iconPreviewEdit" width="30px">
                    </div>
                    <br>
        
                    <label for="itemUrlEdit">Url</label><br>
                    <input type="url" id="itemUrlEdit" name="itemUrlEdit" value="${item.url}"><br>
                    <br>
        
                    <label for="itemCategoryEdit">Category</label><br>
                    <input type="text" id="itemCategoryEdit" name="itemCategoryEdit" value="${item.category}"><br>
                    <br>
                    
                    <label for="openingMethodEdit">Opening method</label><br>
                    <select id="openingMethodEdit" name="openingMethodEdit">
                        <option value="true" ${item.tabType === 'true' ? 'selected' : ''}>New tab</option>
                        <option value="false" ${item.tabType === 'false' ? 'selected' : ''}>Same tab</option>
                    </select>
                </div>
                <button type="button" onclick="applyChanges()">Apply</button>
                <button type="button" onclick="cancelOperation()">Cancel</button>
            `;
        
            const itemIconEditInput = document.getElementById('itemIconEdit')
            const iconPreviewEdit = document.getElementById('iconPreviewEdit')
        
            itemIconEditInput.addEventListener('input', () => {
                iconPreviewEdit.src = itemIconEditInput.value;
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
                name: document.getElementById('itemNameEdit').value,
                icon: document.getElementById('itemIconEdit').value,
                url: document.getElementById('itemUrlEdit').value,
                category: document.getElementById('itemCategoryEdit').value,
                tab_type: document.getElementById('openingMethodEdit').value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: ' + data.error);
            }
        });
    } else {
        console.error("ID item undefined")
    }
}

//################################
//            CREATE
//################################
document.getElementById("createItemBtn").addEventListener('click', function(){
    createItemDialog.showModal();

    createItemDialog.innerHTML = `
        <div class="create-item-wrapper">
            <h2>Create item</h2>

            <label for="itemNameCreate">Name</label><br>
            <input type="text" id="itemNameCreate" name="itemNameCreate"><br>
            <br>

            <label for="itemIconCreate">Icon</label><br>
            <input type="text" id="itemIconCreate" name="itemIconCreate"><br>
            <div class="icon-wrapper">
                <img src="" id="iconPreviewCreate" width="30px">
            </div>
            <br>

            <label for="itemUrlCreate">Url</label><br>
            <input type="url" id="itemUrlCreate" name="itemUrlCreate" value=""><br>
            <br>

            <label for="itemCategoryCreate">Category</label><br>
            <input type="text" id="itemCategoryCreate" name="itemCategoryCreate" value=""><br>
            <br>
            
            <label for="openingMethodCreate">Opening method</label><br>
            <select id="openingMethodCreate" name="openingMethodCreate">
                <option value="true" selected>New tab</option>
                <option value="false">Same tab</option>
            </select>
        </div>
        <button type="button" onclick="createItem()">Create</button>
        <button type="button" onclick="cancelOperation()">Cancel</button>
    `

    const itemIconCreateInput = document.getElementById('itemIconCreate')
    const iconPreviewCreate = document.getElementById('iconPreviewCreate')

    itemIconCreateInput.addEventListener('input', () => {
        iconPreviewCreate.src = itemIconCreateInput.value;
    });
});

function createItem(){
    fetch('/item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id: '0',
            name: document.getElementById('itemNameCreate').value,
            icon: document.getElementById('itemIconCreate').value,
            url: document.getElementById('itemUrlCreate').value,
            category: document.getElementById('itemCategoryCreate').value,
            tab_type: document.getElementById('openingMethodCreate').value
        })  
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload()
        } else {
            throw new Error(data.error);
        }
    });
};

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

    //Create dialog
    createItemDialog.close();

}
//---------------------------------

document.addEventListener("contextmenu", function(event) {
    try {
        let item_selected = event.target.closest("div[itemid]").getAttribute("itemid");
        
        if (item_selected) {
            event.preventDefault();

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
