const contextMenu = document.getElementById('contextMenu');
const deleteItemDialog = document.getElementById('deleteItemDialog');
const editItemDialog = document.getElementById('editItemDialog');
const createItemDialog = document.getElementById('createItemDialog');
const configDialog = document.getElementById('configDialog');

const enablePingStatus = document.getElementById('enablePingStatus');


let currentMouseX = 0;
let currentMouseY = 0;

let itemid = 0;

// Mantener las coordenadas actualizadas
document.addEventListener('mousemove', function(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
});

document.getElementById('configBtn').addEventListener('click', function(){
    configDialog.showModal();
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
             getItemCategories()
                .then(itemCategories => {
                    const categoriesFiltered = itemCategories.filter(cat => cat !== item.category);
                    const categoriesOptions = categoriesFiltered
                        .map(cat => `<option value="${cat}">${cat}</option>`)
                        .join("");

                    editItemDialog.innerHTML = `
                        <div class="edit-item-wrapper dialog-wrapper">
                            <h2>Edit ${item.name}</h2>
                            
                            <p style="color:rgba(255, 255, 255, 0.2); font-style: italic;">id: ${item.id}<p>
                            <label for="itemNameEdit">Name</label><br>
                            <input type="text" id="itemNameEdit" name="itemNameEdit" value="${item.name}"><br>
                            <br>
                
                            <label for="itemIcon">Icon</label><br>
                            <input type="text" id="itemIcon" name="itemIcon" value="${item.icon}"><br>
                            <div class="icon-preview-container">
                                <img src="${item.icon}" id="iconPreview" width="30px">
                            </div>
                            <br>
                
                            <label for="itemUrlEdit">Url</label><br>
                            <input type="url" id="itemUrlEdit" name="itemUrlEdit" value="${item.url}"><br>
                            <br>

                            <label for="itemCategoryEdit">Category</label><br>
                            <select id="itemCategoryEdit" name="itemCategoryEdit">
                                <option value="${item.category}" selected>${item.category}</option>
                                <option value="newCategory">-New category-</option>
                                ${categoriesOptions}
                            </select><br>
                            <br>

                            <div id="newCategoryWrapperEdit" style="display: none; position: fixed;">
                                <label for="newCategoryEdit">New category name</label><br>
                                <input type="text" id="newCategoryEdit" name="newCategoryEdit"><br>
                                <br>
                            </div>

                            <label for="openingMethodEdit">Opening method</label><br>
                            <select id="openingMethodEdit" name="openingMethodEdit">
                                <option value="true" ${item.tabType === 'true' ? 'selected' : ''}>New tab</option>
                                <option value="false" ${item.tabType === 'false' ? 'selected' : ''}>Same tab</option>
                            </select>
                        </div>
                        <button type="button" id="applyItemBtn">Apply</button>
                        <button type="button" onclick="cancelOperation()">Cancel</button>
                    `;

                    const itemCategoryEdit = document.getElementById('itemCategoryEdit');
                    const newCategoryWrapperEdit = document.getElementById('newCategoryWrapperEdit');
                    const newCategoryEdit = document.getElementById('newCategoryEdit');
                    let selectedCategory = item.category; // De forma predeterminada, se le da el valor de la categoría vieja del item
                    
                    itemCategoryEdit.addEventListener('change', () => {
                        if (itemCategoryEdit.value === "newCategory") {
                            newCategoryWrapperEdit.style.display = "block";
                            newCategoryWrapperEdit.style.position = "static";
                            selectedCategory = newCategoryEdit.value;
                        } else {
                            newCategoryWrapperEdit.style.display = "none";
                            newCategoryWrapperEdit.style.position = "fixed";
                            selectedCategory = itemCategoryEdit.value;
                        }
                    });

                    // Dar valor del input text al la categoría 
                    newCategoryEdit.addEventListener('input', () => {
                        if (itemCategoryEdit.value === "newCategory") {
                            selectedCategory = newCategoryEdit.value;
                        }
                    });

                    document.getElementById('itemIcon').addEventListener('input', () => {
                        document.getElementById('iconPreview').src = document.getElementById('itemIcon').value;
                    });

                    document.getElementById('applyItemBtn').addEventListener('click', function(){
                        let finalCategory = selectedCategory;

                        if (itemCategoryEdit.value === "newCategory") {
                            finalCategory = newCategoryEdit.value.trim();
                            if (!finalCategory) {
                                alert("Please enter a category name");
                                return;
                            }
                        }

                        applyChanges(
                            document.getElementById('itemNameEdit').value, 
                            document.getElementById('itemIcon').value, 
                            document.getElementById('itemUrlEdit').value,
                            finalCategory,
                            document.getElementById('openingMethodEdit').value
                        );
                    });
                })
                .catch(err => alert(err));
        })
        .catch(err => alert(err));
});

function applyChanges(name, icon, url, category, tab_type){
    if (itemid != 0) {
        fetch(`/item/${itemid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name,
                icon: icon,
                url: url,
                category: category,
                tab_type: tab_type
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

    getItemCategories()
        .then(itemCategories => {
            const categoryOptions = itemCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

            createItemDialog.innerHTML = `
                <div class="create-item-wrapper dialog-wrapper">
                    <h2>Create item</h2>

                    <label for="itemNameCreate">Name</label><br>
                    <input type="text" id="itemNameCreate" name="itemNameCreate"><br>
                    <br>

                    <label for="itemIcon">Icon</label><br>
                    <input type="text" id="itemIcon" name="itemIcon" value=""><br>
                    <div class="icon-preview-container">
                        <img src="" id="iconPreview" width="30px">
                    </div>
                    <br>

                    <label for="itemUrlCreate">Url</label><br>
                    <input type="url" id="itemUrlCreate" name="itemUrlCreate" value=""><br>
                    <br>

                    <label for="itemCategoryCreate">Category</label><br>
                    <select id="itemCategoryCreate" name="itemCategoryCreate">
                        <option value="newCategory" selected>-New category-</option>
                        ${categoryOptions}
                    </select><br>
                    <br>

                    <div id="newCategoryWrapperCreate">
                        <label for="newCategoryCreate">New category name</label><br>
                        <input type="text" id="newCategoryCreate" name="newCategoryCreate"><br>
                        <br>
                    </div>
                    
                    <label for="openingMethodCreate">Opening method</label><br>
                    <select id="openingMethodCreate" name="openingMethodCreate">
                        <option value="true" selected>New tab</option>
                        <option value="false">Same tab</option>
                    </select>
                </div>
                <button type="button" id="createItemBtnDialog">Create</button>
                <button type="button" onclick="cancelOperation()">Cancel</button>
            `;

            const itemCategoryCreate = document.getElementById('itemCategoryCreate');
            const newCategoryWrapperCreate = document.getElementById('newCategoryWrapperCreate');
            const newCategoryCreate = document.getElementById('newCategoryCreate');
            let selectedCategory = "";

            if (itemCategoryCreate.value === "newCategory") {
                selectedCategory = "";
            } else {
                selectedCategory = itemCategoryCreate.value;
            }

            itemCategoryCreate.addEventListener('change', () => {
                if (itemCategoryCreate.value === "newCategory") {
                    newCategoryWrapperCreate.style.display = "block";
                    newCategoryWrapperCreate.style.position = "static";
                    selectedCategory = newCategoryCreate.value;
                } else {
                    newCategoryWrapperCreate.style.display = "none";
                    newCategoryWrapperCreate.style.position = "fixed";
                    selectedCategory = itemCategoryCreate.value;
                }
            });

            newCategoryCreate.addEventListener('input', () => {
                if (itemCategoryCreate.value === "newCategory") {
                    selectedCategory = newCategoryCreate.value;
                }
            });

            document.getElementById('itemIcon').addEventListener('input', () => {
                document.getElementById('iconPreview').src = document.getElementById('itemIcon').value;
            });

            const createItemBtnDialog = document.getElementById('createItemBtnDialog');
            createItemBtnDialog.addEventListener('click', function() {

                let finalCategory = selectedCategory;
                if (itemCategoryCreate.value === "newCategory") {
                    finalCategory = newCategoryCreate.value.trim();
                    if (!finalCategory) {
                        alert("Please enter a category name");
                        return;
                    }
                }

                createItem(
                    document.getElementById('itemNameCreate').value, 
                    document.getElementById('itemIcon').value, 
                    document.getElementById('itemUrlCreate').value,
                    finalCategory,
                    document.getElementById('openingMethodCreate').value
                );
            });

        })
        .catch(err => alert(err));
});

function createItem(name, icon, url, category, tab_type){
    fetch('/item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id: '0', // Temporal id
            name: name,
            icon: icon,
            url: url,
            category: category,
            tab_type: tab_type
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
                id: data.id,
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    
    try {
        document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
    } catch(error) {
        console.log(error);
    }
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function reloadPage() {
    location.reload()
}

function cancelOperation() {
    //Edit dialog
    editItemDialog.close();
    editItemDialog.innerHTML = `
        <p>Loading...</p>
    `

    //Delete dialog
    deleteItemDialog.close();
    deleteItemDialog.innerHTML = `
        <p>Loading...</p>
    `

    createItemDialog.close();

    configDialog.close()
}
//---------------------------------

async function getItemCategories() {
    return fetch(`/item/categories`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.categories;
        } else {
            throw new Error(data.error);
        }
    });
}

async function getItemStatus() {
    const statusPingElements = document.querySelectorAll('.status-ping');

    if (getCookie("statusPing") === "true") {
        statusPingElements.forEach(el => {
            el.style.display = "inline-block";
        });

        while (true) {
            try {
                const response = await fetch(`/item/status`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                });
    
                const data = await response.json();
    
                if (data.success && Array.isArray(data.status_item)) {
                    data.status_item.forEach(host => {
                        const itemElement = document.querySelector(`.item[itemid="${host.id}"]`);
                        if (itemElement) {
                            const statusPing = itemElement.querySelector('.status-ping');
                            if (statusPing) {
                                statusPing.classList.remove("online", "offline");
                                statusPing.classList.add(host.status ? "online" : "offline");
                            }
                        }
                    });
                } else {
                    console.error('Error en los datos de estado:', data.error);
                }
            } catch (err) {
                console.error('Error actualizando estado:', err);
            }

            await sleep(30 * 1000); // 30 segs
        }
    } else {
        statusPingElements.forEach(el => {
            el.style.display = "none";
        });
    }
}

enablePingStatus.addEventListener('change', () => {
    setCookie("statusPing", enablePingStatus.checked, 365);
});

document.addEventListener("contextmenu", function(event) {
    try {
        let item_selected = event.target.closest("div[itemid]").getAttribute("itemid");
        
        if (item_selected) {
            event.preventDefault();

            itemid = item_selected;

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

window.onload = () => {
    function getStatusConfig() {
        const statusPingCheckBox = document.getElementById('enablePingStatus');
        if (getCookie('statusPing') === "true") {
            statusPingCheckBox.checked = true;
        } else {
            statusPingCheckBox.checked = false;
        }
    }
    getStatusConfig();
    getItemStatus();
};
