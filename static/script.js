const itemsContainer = document.getElementById('items-container');
const contextMenu = document.getElementById('context-menu');

const deleteElementDialog = document.getElementById('delete-element-dialog');
const editElementDialog = document.getElementById('edit-element-dialog');
const createItemDialog = document.getElementById('create-item-dialog');
const configDialog = document.getElementById('config-dialog');
const createProfileDialog = document.getElementById('create-profile-dialog');
const customizeDialog = document.getElementById('customize-dialog');

const selectedProfile = document.getElementById('selected-profile');
const defaultProfile = document.getElementById('default-profile');
const enablePingStatus = document.getElementById('enable-ping-status');


//################################
// GLOBAL VARs
//################################
let currentMouseX = 0;
let currentMouseY = 0;
let currentSelectedItemId = 0;
let currentSelectedCategory = "";
let currentProfile = "";

let organizeModeEnabled = false;

let domSnapshot = null;

document.addEventListener('mousemove', function(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
});

document.getElementById('config-btn').addEventListener('click', function() {
    loadProfilesForConfig();
    configDialog.showModal();
});

document.getElementById('create-item-btn').addEventListener('click', function() {
    createItemDialog.showModal();
});

function saveDomSnapshot() {
    domSnapshot = itemsContainer.innerHTML;
}

function restoreDomSnapshot() {
    if (domSnapshot) {
        itemsContainer.innerHTML = domSnapshot;
    }
}

//################################
//          DELETE ITEM
//################################
document.getElementById('delete-element-btn').addEventListener('click', function(){
    deleteElementDialog.showModal();

    const item_id = currentSelectedItemId;
    const category_name = currentSelectedCategory;

    currentSelectedItemId = 0;
    currentSelectedCategory = "";

    if (category_name === "" && item_id !== 0) {
        getItemData(item_id)
        .then(item => {
            deleteElementDialog.innerHTML = `
                <h2>Delete ${item.item_type} "${item.name}"</h2>
                <p>⚠️ Are you sure?<p>
                <div class="dialog-actions">
                    <button type="button" onclick="deleteItem(${item_id})" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
                    <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
                </div>
            `;
        })
        .catch(err => alert(err));
    }

    if (category_name !== "" && item_id === 0) {
        deleteElementDialog.innerHTML = `
            <h2>Delete category "${category_name}"</h2>
            <p>⚠️ Are you sure? <span style="text-decoration: underline;">All items</span> in this category will be <span style="text-decoration: underline;"">deleted</span>.<p>
            <div class="dialog-actions">
                <button type="button" onclick="deleteCategory('${category_name}')" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
                <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
            </div>
        `;
    }
});

function deleteItem(item_id){
    fetch(`/api/items/${item_id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            deleteElementDialog.close();
            updateDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    });
}

function deleteCategory(category_name){
    fetch(`/api/items/categories/${category_name}&${currentProfile}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            deleteElementDialog.close();
            updateDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    });
}

//################################
//           EDIT ITEM
//################################
document.getElementById('edit-element-btn').addEventListener('click', function(){
    editElementDialog.showModal();

    const item_id = currentSelectedItemId;
    const category_name = currentSelectedCategory;

    currentSelectedItemId = 0;
    currentSelectedCategory = "";

    if (item_id !== 0 && category_name === "") {
        getItemData(item_id)
            .then(item => {
                 getItemCategories()
                    .then(itemCategories => {
                        const categoriesFiltered = itemCategories.filter(cat => cat !== item.category);
                        const categoriesOptions = categoriesFiltered
                            .map(cat => `<option value="${cat}">${cat}</option>`)
                            .join("");
    
                        const itemType = item.item_type;
                            
                        let dialogContent = "";
    
                        if (itemType === "item") {
                            dialogContent = `
                                <div class="edit-item-wrapper dialog-wrapper">
                                    <h2 class="title">Edit item "${item.name}"</h2>
                                    
                                    <div style="margin-bottom: 10px;">
                                        <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">ID: ${item.id}</p>
                                        <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">Type: ${item.item_type}</p>
                                    </div>
            
                                    <div style="display: flex; flex-direction: column; gap: 15px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                                            <input type="text" id="itemNameEdit" value="${item.name}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                                        </div>
            
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Icon URL <span style="font-weight: normal; font-style: italic; color: rgba(255, 255, 255, 0.2); font-size: 0.8rem;"> It can also be an emoji</span></label>
                                            <div style="display: flex; gap: 10px; align-items: center;">
                                                <input type="text" id="itemIcon" value="${item.icon}" style="flex-grow: 1; padding: 8px;">
                                                <div style="background: #0b1021; padding: 5px; border-radius: 4px; display: flex; align-items: center;">
                                                    <img src="${item.icon}" id="iconPreview" width="30px" height="30px" style="object-fit: contain;">
                                                </div>
                                            </div>
                                        </div>
            
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL</label>
                                            <input type="url" id="itemUrlEdit" value="${item.url}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                                        </div>
            
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category</label>
                                            <select id="itemCategoryEdit" style="width: 100%; padding: 8px;">
                                                <option value="${item.category}" selected>${item.category}</option>
                                                <option value="newCategory">- New category -</option>
                                                ${categoriesOptions}
                                            </select>
                                        </div>
            
                                        <div id="newCategoryWrapperEdit" style="display: none; background: #0b1021; padding: 10px; border-radius: 4px;">
                                            <label style="display: block; margin-bottom: 5px;">New category name</label>
                                            <input type="text" id="newCategoryEdit" style="width: 100%; padding: 8px; box-sizing: border-box;">
                                        </div>
            
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Opening method</label>
                                            <select id="openingMethodEdit" style="width: 100%; padding: 8px;">
                                                <option value="true" ${item.tabType === 'true' ? 'selected' : ''}>New tab</option>
                                                <option value="false" ${item.tabType === 'false' ? 'selected' : ''}>Same tab</option>
                                            </select>
                                        </div>
                                    </div>
            
                                    <div class="dialog-actions">
                                        <button type="button" class="success-btn" id="applyItemBtn">Apply</button>
                                        <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
                                    </div>
                                </div>`;
                        } else if (itemType === "iframe") {
                            dialogContent = `
                                <div class="edit-item-wrapper dialog-wrapper">
                                    <h2 class="title">Edit iframe "${item.name}"</h2>
                                    <div style="margin-bottom: 10px;">
                                        <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">ID: ${item.id}</p>
                                        <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">Type: ${item.item_type}</p>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 15px;">
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                                            <input type="text" id="itemNameEdit" value="${item.name}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL</label>
                                            <input type="url" id="itemUrlEdit" value="${item.url}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                                        </div>
                                    </div>
                                    <div class="dialog-actions">
                                        <button type="button" class="success-btn" id="applyItemBtn">Apply</button>
                                        <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
                                    </div>
                                </div>`;
                        }
    
                        editElementDialog.innerHTML = dialogContent;
    
                        const itemCategoryEdit = document.getElementById('itemCategoryEdit');
                        const newCategoryWrapperEdit = document.getElementById('newCategoryWrapperEdit');
                        const newCategoryEdit = document.getElementById('newCategoryEdit');
                        let selectedCategory = item.category;
    
                        if (itemCategoryEdit) {
                            itemCategoryEdit.addEventListener('change', () => {
                                if (itemCategoryEdit.value === "newCategory") {
                                    newCategoryWrapperEdit.style.display = "block";
                                    selectedCategory = newCategoryEdit.value;
                                } else {
                                    newCategoryWrapperEdit.style.display = "none";
                                    selectedCategory = itemCategoryEdit.value;
                                }
                            });
        
                            newCategoryEdit.addEventListener('input', () => {
                                if (itemCategoryEdit.value === "newCategory") {
                                    selectedCategory = newCategoryEdit.value;
                                }
                            });
                        }
    
                        const itemIcon = document.getElementById('itemIcon');
                        if (itemIcon && item.item_type == "item") {
                            itemIcon.addEventListener('input', () => {
                                document.getElementById('iconPreview').src = itemIcon.value;
                            });
                        }
    
                        const applyItemBtn = document.getElementById('applyItemBtn');
                        if (applyItemBtn) {
                            applyItemBtn.addEventListener('click', function(){
                                switch(itemType) {
                                    case "item":
                                        let finalCategory = selectedCategory;
                                        if (itemCategoryEdit && itemCategoryEdit.value === "newCategory") {
                                            finalCategory = newCategoryEdit.value.trim();
                                            if (!finalCategory) {
                                                alert("Please enter a category name");
                                                return;
                                            }
                                        }
    
                                        updateItemDetails(
                                            item_id,
                                            document.getElementById('itemNameEdit').value,
                                            "item",
                                            document.getElementById('itemIcon').value, 
                                            document.getElementById('itemUrlEdit').value,
                                            finalCategory,
                                            document.getElementById('openingMethodEdit').value
                                        );
                                        break;
                                    case "iframe":
                                        updateItemDetails(
                                            item_id,
                                            document.getElementById('itemNameEdit').value,
                                            "iframe",
                                            "",
                                            document.getElementById('itemUrlEdit').value,
                                            "",
                                            ""
                                        );
                                        break;
                                }
                                editElementDialog.close();
                            });
                        }
                    })
                    .catch(err => alert(err));
            })
            .catch(err => alert(err));
    }

    if (category_name !== "" && item_id === 0) {
        dialogContent = `
            <div class="edit-item-wrapper dialog-wrapper">
                <h2 class="title">Edit category "${category_name}"</h2>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                        <input type="text" id="categoryNameEdit" value="${category_name}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>
                </div>
                <div class="dialog-actions">
                    <button type="button" class="success-btn" id="applyCategoryBtn">Apply</button>
                    <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
                </div>
            </div>`;
        
        editElementDialog.innerHTML = dialogContent;
        
        const applyCategoryBtn = document.getElementById('applyCategoryBtn');
        if (applyCategoryBtn) {
            applyCategoryBtn.addEventListener('click', function(){
                category_name_edit = document.getElementById('categoryNameEdit').value;

                fetch(`/api/items/categories/${category_name}&${currentProfile}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: category_name_edit
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateDashboard();
                    } else {
                        alert('Error: ' + data.error);
                    }
                });
                editElementDialog.close();
            })
        }
    }
});

function updateItemDetails(item_id, name, item_type, icon, url, category, tab_type){
    if (item_id != 0) {
        fetch(`/api/items/${item_id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name,
                item_type: item_type,
                icon: icon,
                url: url,
                category: category,
                tab_type: tab_type,
                profile: currentProfile
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateDashboard();
            } else {
                alert('Error: ' + data.error);
            }
        });
    } else {
        console.error("ID item undefined")
    }
}

function updateItemCategory(item_id, category_name) {
    fetch(`/api/items/${item_id}/category`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            category: category_name
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
        } else {
            alert('Error: ' + data.error);
        }
    });
}

//################################
//         CREATE ITEM
//################################
document.getElementById("create-item-btn").addEventListener('click', function(){
    createItemDialog.showModal();

    getItemCategories()
        .then(itemCategories => {
            const categoryOptions = itemCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

            createItemDialog.innerHTML = `
                <div class="create-item-wrapper dialog-wrapper" style="font-family: sans-serif; padding: 20px; color: white; border-radius: 8px;">
                    <h2 class="title" id="createItemTitle" style="margin-top: 0; padding-bottom: 10px;">Create item</h2>

                    <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Type</label>
                            <input type="radio" id="item-type-item" name="radio-item-type" value="item" required checked>
                            <label for="item-type-item">Item</label>
                            <input type="radio" id="item-type-iframe" name="radio-item-type" value="iframe">
                            <label for="item-type-iframe">Iframe</label>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                            <input type="text" id="itemNameCreate" placeholder="Item name..." style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>

                        <div id="iconURLWrapperCreate">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Icon URL <span style="font-weight: normal; font-style: italic; color: rgba(255, 255, 255, 0.2); font-size: 0.8rem;"> It can also be an emoji</span></label>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="text" id="itemIcon" placeholder="https://..." style="flex-grow: 1; padding: 8px;">
                                <div style="background: #0b1021; padding: 5px; border-radius: 4px; display: flex; align-items: center; min-width: 30px; min-height: 30px;">
                                    <img src="/static/preview-icon.png" id="iconPreview" width="30px" height="30px" style="object-fit: contain;">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL</label>
                            <input type="url" id="itemUrlCreate" placeholder="https://google.com" style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>

                        <div id="categoryWrapperCreate">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category</label>
                            <select id="itemCategoryCreate" style="width: 100%; padding: 8px;">
                                <option value="newCategory" selected>- New category -</option>
                                ${categoryOptions}
                            </select>
                        </div>

                        <div id="newCategoryWrapperCreate" style="background: #0b1021; padding: 10px; border-radius: 4px;">
                            <label style="display: block; margin-bottom: 5px;">New category name</label>
                            <input type="text" id="newCategoryCreate" style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>

                        <div id="openingMethodWrapperCreate">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Opening method</label>
                            <select id="openingMethodCreate" style="width: 100%; padding: 8px;">
                                <option value="true" selected>New tab</option>
                                <option value="false">Same tab</option>
                            </select>
                        </div>
                    </div>

                    <div class="dialog-actions">
                        <button type="button" class="success-btn" id="createItemBtnDialog">Create</button>
                        <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
                    </div>
                </div>
            `;

            const createItemTitle = document.getElementById('createItemTitle');
            const itemNameCreate = document.getElementById('itemNameCreate');
            const itemUrlCreate = document.getElementById('itemUrlCreate');
            
            const itemTypeItem = document.getElementById('item-type-item');
            const itemTypeIframe = document.getElementById('item-type-iframe');

            const itemCategoryCreate = document.getElementById('itemCategoryCreate');
            const newCategoryWrapperCreate = document.getElementById('newCategoryWrapperCreate');
            const newCategoryCreate = document.getElementById('newCategoryCreate');
            const categoryWrapperCreate = document.getElementById('categoryWrapperCreate');
            
            let selectedCategory = "";

            if (itemCategoryCreate && itemCategoryCreate.value === "newCategory") {
                selectedCategory = "";
            } else if (itemCategoryCreate) {
                selectedCategory = itemCategoryCreate.value;
            }

            if (itemCategoryCreate) {
                itemCategoryCreate.addEventListener('change', () => {
                    if (itemCategoryCreate.value === "newCategory") {
                        newCategoryWrapperCreate.style.display = "block";
                        selectedCategory = newCategoryCreate.value;
                    } else {
                        newCategoryWrapperCreate.style.display = "none";
                        selectedCategory = itemCategoryCreate.value;
                    }
                });
            }

            if (newCategoryCreate) {
                newCategoryCreate.addEventListener('input', () => {
                    if (itemCategoryCreate && itemCategoryCreate.value === "newCategory") {
                        selectedCategory = newCategoryCreate.value;
                    }
                });
            }

            const itemIconCreate = document.getElementById('itemIcon');
            if (itemIconCreate) {
                itemIconCreate.addEventListener('input', () => {
                    document.getElementById('iconPreview').src = itemIconCreate.value;
                });
            }

            const itemTypeRadios = document.querySelectorAll('input[name="radio-item-type"]');
            itemTypeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const iconWrapper = document.getElementById('iconURLWrapperCreate');
                    const openingMethodWrapper = document.getElementById('openingMethodWrapperCreate');
                    
                    if (e.target.value === 'item') {
                        if (iconWrapper) iconWrapper.style.display = 'block';
                        if (openingMethodWrapper) openingMethodWrapper.style.display = 'block';
                        if (categoryWrapperCreate) categoryWrapperCreate.style.display = 'block';
                        
                        if (itemCategoryCreate.value === "newCategory") {
                             newCategoryWrapperCreate.style.display = 'block';
                        }

                        createItemTitle.innerHTML = "Create item";
                        itemNameCreate.placeholder = "Item name...";
                        itemUrlCreate.placeholder = "https://google.com";

                    } else if (e.target.value === 'iframe') {
                        if (iconWrapper) iconWrapper.style.display = 'none';
                        if (openingMethodWrapper) openingMethodWrapper.style.display = 'none';
                        if (categoryWrapperCreate) categoryWrapperCreate.style.display = 'none';
                        if (newCategoryWrapperCreate) newCategoryWrapperCreate.style.display = 'none';

                        createItemTitle.innerHTML = "Create iframe";
                        itemNameCreate.placeholder = "Iframe name...";
                        itemUrlCreate.placeholder = "https://...";
                    }
                });
            });

            const createItemBtnDialog = document.getElementById('createItemBtnDialog');
            if (createItemBtnDialog) {
                createItemBtnDialog.addEventListener('click', function() {

                    if (itemTypeItem.checked) {
                        let finalCategory = selectedCategory;
                        if (itemCategoryCreate && itemCategoryCreate.value === "newCategory") {
                            finalCategory = newCategoryCreate.value.trim();
                            if (!finalCategory) {
                                alert("Please enter a category name");
                                return;
                            }
                        }
                        createItem(
                            document.getElementById('itemNameCreate').value,
                            "item",
                            document.getElementById('itemIcon').value, 
                            document.getElementById('itemUrlCreate').value,
                            finalCategory,
                            document.getElementById('openingMethodCreate').value
                        );
                    }

                    if (itemTypeIframe.checked) {
                        createItem(
                            document.getElementById('itemNameCreate').value, 
                            "iframe",
                            "", 
                            document.getElementById('itemUrlCreate').value,
                            "",
                            ""
                        );
                    }
                    createItemDialog.close();
                });
            }

        })
        .catch(err => alert(err));
});

function createItem(name, item_type, icon, url, category, tab_type){
    fetch('/api/items', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id: '0', 
            name: name,
            item_type,
            icon: icon,
            url: url,
            category: category,
            tab_type: tab_type,
            profile: currentProfile
        })  
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateDashboard();
        } else {
            throw new Error(data.error);
        }
    });
};

//################################
//       GENERAL FUNCTIONS
//################################
document.addEventListener('click', function(e) {
    if (e.target.id === 'cancel-btn' || e.target.classList.contains('cancel-btn')) {
        cancelOperation();
    }
});

function getItemData(item_id) {
    return fetch(`/api/items/${item_id}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return {
                id: data.id,
                name: data.name,
                item_type: data.item_type,
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

function existCookie(name) {
    const cookies = document.cookie.split(";").map(c => c.trim());
    return cookies.some(cookie => cookie.startsWith(name + "="));
}

function reloadPage() {
    location.reload()
}

function cancelOperation() {
    editElementDialog.close();
    editElementDialog.innerHTML = `<p>Loading...</p>`;

    deleteElementDialog.close();
    deleteElementDialog.innerHTML = `<p>Loading...</p>`;

    createItemDialog.close();

    configDialog.close();
    createProfileDialog.close();
    customizeDialog.close();;
}

async function getItemsByCategory() {
    let request;
    if (currentProfile) {
        request = `/api/items?profile=${currentProfile}`
    } else {
        request = "/api/items"
    }

    return fetch(request, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.items
        } else {
            throw new Error(data.error);
        }
    });
}

async function renderDashboard(items, categories) {
    let html = [];

    const filteredItems = items.filter(item => item.profile === currentProfile);
    
    if (filteredItems.length === 0) {
        itemsContainer.style.width = "50%";
        itemsContainer.innerHTML = `<p style="text-align:center;">No items were found in this profile. Create an item to use.</p>`;
        return;
    } else {
        itemsContainer.removeAttribute("style");
        itemsContainer.innerHTML = "";
    }

    const regularItems = filteredItems.filter(item => item.item_type === "item");
    const otherItems = filteredItems.filter(item => item.item_type !== "item");

    const itemsWithCategory = regularItems.filter(item => item.category);
    const itemsWithoutCategory = regularItems.filter(item => !item.category);

    if (itemsWithoutCategory.length > 0) {
        html.push(`
            <div class="category" data-category="uncategorized">
                <div class="category-header category-button" role="button" tabindex="0">
                    <h3>Uncategorized</h3>
                </div>
            <div class="items-wrapper">
        `);
        
        for (const item of itemsWithoutCategory) {
            html.push(renderItemByType(item));
        }
        
        html.push(`
                </div>
            </div>
        `);
    }

    const categoriesWithItems = [...new Set(itemsWithCategory.map(item => item.category))];
    const categoriesToShow = categories.filter(category => categoriesWithItems.includes(category));

    for (const category of categoriesToShow) {
        const categoryItems = itemsWithCategory.filter(item => item.category === category);
        
        if (categoryItems.length > 0) {
            html.push(`
                <div class="category" data-category="${category}">
                    <div class="category-header category-button" role="button" tabindex="0">
                        <h3>${category}</h3>
                    </div>
                <div class="items-wrapper">
            `);
            
            for (const item of categoryItems) {
                html.push(renderItemByType(item));
            }
            
            html.push(`
                    </div>
                </div>
            `);
        }
    }

    for (const item of otherItems) {
        html.push(renderItemByType(item));
    }
    
    itemsContainer.innerHTML = html.join("");
}

function renderItemByType(item) {
    let target = item.tab_type ? "_blank" : "_self";
    
    switch(item.item_type) {
        case "item":
            let icon_element = `
                <img class="item-icon" src="${item.icon}" alt="${item.name} icon" loading="lazy">
            `;

            // Check if icon is an emoji
            if (/\p{Extended_Pictographic}/u.test(item.icon)) {
                icon_element = `
                    <span class="item-icon emoji-icon" aria-hidden="true">
                        ${item.icon}
                    </span>
                `;
            }

            return `
            <div class="item-card" data-id="${item.id}" data-type="item" data-category="${item.category}">
                <a href="${item.url}" target="${target}">
                    <div class="item-content" tabindex="0">
                        <p class="item-title">${item.name}</p>
                        ${icon_element}
                        <span class="status-ping" id="statusPing">•</span>
                    </div>
                </a>
            </div>
            `;
        
        case "iframe":
            return `
                <div class="iframe-item" data-id="${item.id}" data-type="iframe" data-category="${item.category}">
                    <div class="iframe-header iframe-button" tabindex="0">
                        <h2 class="iframe-title">${item.name}</h2>
                    </div>
                    <iframe 
                        class="iframe-content" 
                        src="${item.url}"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; microphone; camera; display-capture"
                        allowfullscreen
                        onerror="this.style.display='none'; this.parentElement.innerHTML += '<p style=\'text-align:center; padding:20px;\'>❌ This site cannot be displayed in an iframe</p>'"
                    ></iframe>
                </div>
            `;
    }
}

async function updateDashboard() {
    const items = await getItemsByCategory();
    const categories = await getItemCategories();
    await renderDashboard(items, categories);
        
    restoreCollapsableElementsStates();
}

async function getItemProfiles() {
    return fetch(`/api/items/profiles`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.profiles;
        } else {
            throw new Error(data.error);
        }
    });
}

async function getItemCategories() {
    return fetch(`/api/items/categories`, {
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

function getCurrentItemsProfiles(items) {
    let itemsProfiles = []
    for (let item of items) {
        itemsProfiles.push(item.profile)
    }
    return itemsProfiles;
}

async function loadProfilesUi(){
    const selectedProfileElement = document.querySelector('#selected-profile');
    const profiles = await getItemProfiles()

    for (let profile of profiles) {
            const option = document.createElement('option');
            option.value = profile;
            option.textContent = profile;
            selectedProfileElement.add(option);
    }
    selectedProfileElement.value = getDefaultProfile()
}

async function loadProfilesForConfig(){
    const defaultProfileElement = document.querySelector('#default-profile');
    const profiles = await getItemProfiles()

    for (let profile of profiles) {
            const option = document.createElement('option');
            option.value = profile;
            option.textContent = profile;
            defaultProfileElement.add(option);
    }
    defaultProfileElement.value = getCookie("profile");
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
                        const itemElement = document.querySelector(`.item-card[data-id="${host.id}"]`);
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

function getDefaultProfile() {
    let profile;
    if (existCookie("profile")) {
        profile = getCookie("profile")
    } else {
        setCookie("profile", "default", 365) // Default profile
        profile = getCookie("profile")
    }
    return profile
}

function createProfile() {
    const createProfileInput = document.getElementById("create-profile-input");
    currentProfile = createProfileInput.value;
    createProfileDialog.close();
    updateDashboard();
}

selectedProfile.addEventListener('change', async () =>{
    if (selectedProfile.value === "_new%profile_") {
        createProfileDialog.showModal();
    } else {
        currentProfile = selectedProfile.value;
        updateDashboard();
    }
})

defaultProfile.addEventListener('change', async() =>{
    setCookie("profile", defaultProfile.value, 365);
})

enablePingStatus.addEventListener('change', () => {
    setCookie("statusPing", enablePingStatus.checked, 365);
});


//################################
//        COLLAPSE ITEMS
//################################

// CATEGORIES
document.addEventListener('click', (e) => {
    const categoryBtn = e.target.closest('.category-button');

    if (categoryBtn) {
        const categoryDiv = categoryBtn.closest('.category');
        const category = categoryDiv.dataset.category;
        const itemWrapper = categoryBtn.nextElementSibling; 

        if (itemWrapper && itemWrapper.classList.contains('items-wrapper')) {
            flipElement(() => {
                const isHidden = itemWrapper.classList.toggle('hidden');
                localStorage.setItem('category-collapsed-' + category, isHidden);
            });
        }
    }
});

// IFRAMES
document.addEventListener('click', (e) => {
    const iframeBtn = e.target.closest('.iframe-button');

    if (iframeBtn) {
        const iframe = iframeBtn.nextElementSibling;

        if (iframe && iframe.classList.contains('iframe-content')) {
            flipElement(() => {
                const isHidden = iframe.classList.toggle('hidden');
                localStorage.setItem('iframe-collapsed-' + iframe.dataset.id, isHidden);
            });
        }
    }
});

function restoreCollapsableElementsStates() {
    document.querySelectorAll('.category').forEach(categoryDiv => {
        const category = categoryDiv.dataset.category;
        const wrapper = categoryDiv.querySelector('.items-wrapper');
        const collapsed = localStorage.getItem('category-collapsed-' + category);

        if (collapsed === "true" && wrapper) {
            wrapper.classList.add('hidden');
        } else if (wrapper) {
            wrapper.classList.remove('hidden');
        }
    });

    document.querySelectorAll('.iframe-content').forEach(iframe => {
        const collapsed = localStorage.getItem('iframe-collapsed-' + iframe.dataset.id);

        if (collapsed === "true") {
            iframe.classList.add('hidden');
        } else {
            iframe.classList.remove('hidden');
        }
    });
}


//################################
//         CONTEXT MENU
//################################

document.addEventListener("contextmenu", function(event) {
    try {
        let itemWrapper = event.target.closest("[data-id]");
        let categoryWrapper = event.target.closest(".category");

        if (itemWrapper) {
            event.preventDefault();

            currentSelectedItemId = Number(itemWrapper.dataset.id);
            currentSelectedCategory = "";

            contextMenu.style.display = 'block';
            contextMenu.style.top = currentMouseY + 'px';
            contextMenu.style.left = currentMouseX + 'px';
        } else if (categoryWrapper) {
            event.preventDefault();
            currentSelectedCategory = categoryWrapper.dataset.category;
            currentSelectedItemId = 0;

            contextMenu.style.display = 'block';
            contextMenu.style.top = currentMouseY + 'px';
            contextMenu.style.left = currentMouseX + 'px';
        }
    } catch (error) {
        console.error(error);
    }
});

document.addEventListener("click", function(event) {
    if (!event.target.closest('#contextMenu') || event.target.closest('#toolbox')) {
        contextMenu.style.display = "none";
    }
});


// ################################
//        FLIP ANIMATION
// ################################

function flipElement(callback) {
    const elements = [...document.querySelectorAll('.category, .iframe-item')];
    const first = new Map();

    elements.forEach(el => {
        first.set(el, el.getBoundingClientRect());
    });

    callback();

    requestAnimationFrame(() => {
        elements.forEach(el => {
            const last = el.getBoundingClientRect();
            const prev = first.get(el);
            if (!prev) return;

            const dx = prev.left - last.left;
            const dy = prev.top - last.top;

            if (dx || dy) {
                el.style.transform = `translate(${dx}px, ${dy}px)`;
                el.style.transition = 'none';

                requestAnimationFrame(() => {
                    el.style.transform = '';
                    el.style.transition =
                        'transform 420ms cubic-bezier(.22,.61,.36,1)';
                });
            }
        });
    });
}

// ################################
//        DATABASE TRANSFER
// ################################
const fileInput = document.getElementById('file-input-import');
const importDbBtn = document.getElementById('import-db-btn');

importDbBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.onchange = function() {
    if (fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/api/import/database', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (configDialog) configDialog.close();
            updateDashboard();
            fileInput.value = "";
        } else {
            alert(data.error);
        }
    })
    .catch(err => alert(err));
}


// ################################
//      COLOR PERSONALIZATION
// ################################
const customizeWrapper = document.getElementById('customize-wrapper');

const colorPrimary = document.getElementById('color-primary');
const colorBgMain = document.getElementById('color-bg-main');
const colorBgSecondary = document.getElementById('color-bg-secondary');
const colorBgMenu = document.getElementById('color-bg-menu');
const colorBgItem = document.getElementById('color-bg-item');
const colorText = document.getElementById('color-text');
const colorCategory = document.getElementById('color-category');
const colorCategoryHeader = document.getElementById('color-category-header');
const colorIframe = document.getElementById('color-iframe');
const colorIframeHeader = document.getElementById('color-iframe-header');

document.getElementById('save-colors-btn').addEventListener('click', saveColors);
document.getElementById('reset-colors-btn').addEventListener('click', resetColors);

const defaultColors = {
    'color-primary': '#6f60eb',
    'bg-main': '#141b33',
    'bg-secondary': '#0b1021',
    'bg-menu': '#1f294d',
    'bg-item': '#141b33',
    'color-text': '#ffffff',
    'color-category': '#6f60eb',
    'color-category-header': '#503fe4',
    'color-iframe': '#60d4eb',
    'color-iframe-header': '#3fb9e4'
};

const colorInputs = {
    'color-primary': colorPrimary,
    'bg-main': colorBgMain,
    'bg-secondary': colorBgSecondary,
    'bg-menu': colorBgMenu,
    'bg-item': colorBgItem,
    'color-text': colorText,
    'color-category': colorCategory,
    'color-category-header': colorCategoryHeader,
    'color-iframe': colorIframe,
    'color-iframe-header': colorIframeHeader
};

function loadColors() {
    for (let [varName, defaultValue] of Object.entries(defaultColors)) {
        let storedValue = localStorage.getItem(varName);
        
        if (!storedValue) {
            storedValue = defaultValue;
            localStorage.setItem(varName, defaultValue);
        }
        
        document.documentElement.style.setProperty('--' + varName, storedValue);
    }
}

function saveColors() {
    const colors = {
        'color-primary': colorPrimary.value,
        'bg-main': colorBgMain.value,
        'bg-secondary': colorBgSecondary.value,
        'bg-menu': colorBgMenu.value,
        'bg-item': colorBgItem.value,
        'color-text': colorText.value,
        'color-category': colorCategory.value,
        'color-category-header': colorCategoryHeader.value,
        'color-iframe': colorIframe.value,
        'color-iframe-header': colorIframeHeader.value
    };

    for (let [varName, value] of Object.entries(colors)) {
        localStorage.setItem(varName, value);
        document.documentElement.style.setProperty('--' + varName, value);
    }
}

function resetColors() {
    for (let [varName, defaultValue] of Object.entries(defaultColors)) {        
        if (colorInputs[varName]) {
            colorInputs[varName].value = defaultValue;
        }
    }
}

document.getElementById('customize-btn').addEventListener('click', function(){
    customizeDialog.showModal();

    let colorPrimaryValue = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    let colorBgMainValue = getComputedStyle(document.documentElement).getPropertyValue('--bg-main').trim();
    let colorBgSecondaryValue = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
    let colorBgMenuValue = getComputedStyle(document.documentElement).getPropertyValue('--bg-menu').trim();
    let colorBgItem = getComputedStyle(document.documentElement).getPropertyValue('--bg-item').trim();
    let colorTextValue = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
    let colorCategoryValue = getComputedStyle(document.documentElement).getPropertyValue('--color-category').trim();
    let colorCategoryHeaderValue = getComputedStyle(document.documentElement).getPropertyValue('--color-category-header').trim();
    let colorIframeValue = getComputedStyle(document.documentElement).getPropertyValue('--color-iframe').trim();
    let colorIframeHeaderValue = getComputedStyle(document.documentElement).getPropertyValue('--color-iframe-header').trim();

    colorPrimary.value = colorPrimaryValue;
    colorBgMain.value = colorBgMainValue;
    colorBgSecondary.value = colorBgSecondaryValue;
    colorBgMenu.value = colorBgMenuValue;
    colorBgItem.value = colorBgItem;
    colorText.value = colorTextValue;
    colorCategory.value = colorCategoryValue;
    colorCategoryHeader.value = colorCategoryHeaderValue;
    colorIframe.value = colorIframeValue;
    colorIframeHeader.value = colorIframeHeaderValue;
});


// ################################
//           SEARCH BAR
// ################################

const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const defaultSearchEndponint = "https://www.google.com/search?q=";
const defaultSearchBarOpeningMethod = "_blank";

let searchEndpoint = defaultSearchEndponint;
let searchBarOpeningMethod = defaultSearchBarOpeningMethod;

searchInput.addEventListener('keydown', () => {
    if (event.key === 'Enter') {
        search(searchInput.value);
    }
});

searchBtn.addEventListener('click', () => {
    search(searchInput.value);
});

function search(query) {
    window.open(searchEndpoint + query, searchBarOpeningMethod);
    searchInput.value = "";
}

function loadSearchBar() {
    // Enable searchbar
    let svEnableSearchBar = localStorage.getItem('enable-search-bar');
    if (svEnableSearchBar === "true") {
        searchBar.style.display = "flex";
    } else {
        searchBar.style.display = "none";
    }
    if (svEnableSearchBar === null) {
        localStorage.setItem('enable-search-bar', 'true');
        searchBar.style.display = "flex";
    }

    // Enable autofocus in searchbar
    let svEnableAutofocus = localStorage.getItem('enable-autofocus-search-bar');
    if (svEnableAutofocus === "true") {
        searchInput.focus();
    } else {
        searchInput.removeAttribute('autofocus');
    }
    if (svEnableAutofocus === null) {
        localStorage.setItem('enable-autofocus-search-bar', 'true');
        searchInput.focus();
    }

    // Opening method
    let svOpeningMethod = localStorage.getItem('search-bar-opening-method');
    if (svOpeningMethod === "_blank") {
        searchBarOpeningMethod = "_blank";
    } else {
        searchBarOpeningMethod = "_self";
    }
    if (svOpeningMethod === null) {
        localStorage.setItem('search-bar-opening-method', '_blank');
        searchBarOpeningMethod = "_blank";
    }
}

function loadSearchEndpoint() {
    let storedValue = localStorage.getItem('search-endpoint');
    if (storedValue) {
        searchEndpoint = storedValue;
    } else {
        searchEndpoint = defaultSearchEndponint;
        localStorage.setItem('search-endpoint', defaultSearchEndponint);
    }
}


// ################################
//     CONFIG / SETTINGS DIALOG
// ################################

const applySettingsBtn = document.getElementById('apply-config-btn');


applySettingsBtn.addEventListener('click', () => {
    saveSearchBarConfig();
    
    reloadPage();
});

const enableSearchBarCheckBox = document.getElementById('enable-search-bar');
const enableAutofocusSearchBarCheckBox = document.getElementById('enable-autofocus-search-bar');
const openingSearchBarMethodSelect = document.getElementById('search-bar-opening-method');

const statusPingCheckBox = document.getElementById('enable-ping-status');

function loadConfigInputState() {
    // SearchBar
    //      Enable searchbar
    if (localStorage.getItem('enable-search-bar') === "true") {
        enableSearchBarCheckBox.checked = true;
    } else {
        enableSearchBarCheckBox.checked = false;
    }
    if (document.getElementById('search-endpoint')) {
        document.getElementById('search-endpoint').value = searchEndpoint;
    }
    //      Enable autofocus
    if (localStorage.getItem('enable-autofocus-search-bar') === "true") {
        enableAutofocusSearchBarCheckBox.checked = true;
    } else {
        enableAutofocusSearchBarCheckBox.checked = false;
    }
    //      Opening method
    if (localStorage.getItem('search-bar-opening-method') === "_blank") {
        openingSearchBarMethodSelect.value = "_blank";
    } else {
        openingSearchBarMethodSelect.value = "_self";
    }

    // Ping status
    if (getCookie('statusPing') === "true") {
        statusPingCheckBox.checked = true;
    } else {
        statusPingCheckBox.checked = false;
    }
}

// SAVE CONFIG FUNCTIONS
function saveSearchBarConfig() {
    // State
    if (enableSearchBarCheckBox.checked) {
        localStorage.setItem('enable-search-bar', 'true');
    } else {
        localStorage.setItem('enable-search-bar', 'false');
    }

    // Endpoint
    const searchEndpoint = document.getElementById('search-endpoint').value;
    if (searchEndpoint) {
        localStorage.setItem('search-endpoint', searchEndpoint);
    }

    // Autofocus
    if (enableAutofocusSearchBarCheckBox.checked) {
        localStorage.setItem('enable-autofocus-search-bar', 'true');
    } else {
        localStorage.setItem('enable-autofocus-search-bar', 'false');
    }

    // Opening method
    if (openingSearchBarMethodSelect.value === "_blank") {
        localStorage.setItem('search-bar-opening-method', '_blank');
    } else {
        localStorage.setItem('search-bar-opening-method', '_self');
    }
}


// ################################
//         DRAG AND DROP
// ################################

const organizeBtn = document.getElementById('organize-btn');
const organizeModeActions = document.getElementById('organize-mode-actions');

let listItemsMoved = new Map();

organizeBtn.addEventListener('click', () => {
    if (!organizeModeEnabled) {
        saveDomSnapshot();
    }

    organizeModeEnabled = !organizeModeEnabled;
    
    if (organizeModeEnabled) {
        enableShakeMode();
        organizeModeActions.style.display = "flex";
    } else {
        restoreDomSnapshot();
        disableShakeMode();
        organizeModeActions.style.display = "none";
    }
});

document.getElementById('apply-organize-btn').addEventListener('click', async () => {
    domSnapshot = null;
    disableShakeMode();
    organizeModeEnabled = false;
    organizeModeActions.style.display = "none";
    
    // Array de promesas
    const updatePromises = [];
    listItemsMoved.forEach((newCategory, itemId) => {
        updatePromises.push(updateItemCategory(itemId, newCategory));
    });
    
    // Espera a que se completen todas las promesas
    await Promise.all(updatePromises);
    
    listItemsMoved.clear();
    updateDashboard();
});

document.getElementById('cancel-organize-btn').addEventListener('click', () => {
    restoreDomSnapshot();
    disableShakeMode();
    organizeModeEnabled = false;
    organizeModeActions.style.display = "none";
});

function enableShakeMode() {
    const items = document.querySelectorAll('.item-card');
    items.forEach(item => item.classList.add('shaking'));
}

function disableShakeMode() {
    const items = document.querySelectorAll('.item-card');
    items.forEach(item => item.classList.remove('shaking'));
}

let draggingItem = null;
let originalParent = null;
let originalNextSibling = null;

let offsetX = 0;
let offsetY = 0;

function onItemDrag(e) {
    if (draggingItem) {
        draggingItem.style.left = (e.clientX - offsetX) + "px";
        draggingItem.style.top = (e.clientY - offsetY) + "px";
    }
}

function onItemDrop(item, category) {
    const itemsWrapper = category.querySelector('.items-wrapper');
    itemsWrapper.appendChild(item);
    item.style.left = "";
    item.style.top = "";

    item.dataset.category = category.dataset.category;
    listItemsMoved.set(item.dataset.id, category.dataset.category);
}

document.addEventListener('mousedown', (e) => {
    if (!organizeModeEnabled) return;
    
    const itemCard = e.target.closest(".item-card");
    
    if (itemCard) {
        e.preventDefault();
        
        const rect = itemCard.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        originalParent = itemCard.parentElement;
        originalNextSibling = itemCard.nextElementSibling;

        draggingItem = itemCard;
        
        itemCard.style.left = rect.left + "px";
        itemCard.style.top = rect.top + "px";
        itemCard.style.width = rect.width + "px";
        itemCard.style.height = rect.height + "px";
        
        itemCard.classList.add("dragging");
        document.body.appendChild(itemCard);
        
        document.addEventListener("mousemove", onItemDrag);
    }
});
 
document.addEventListener('mouseup', (e) => {
    if (!organizeModeEnabled) return;
    
    if (draggingItem) {
        const categoryDropped = e.target.closest(".category");
        
        document.removeEventListener("mousemove", onItemDrag);
        draggingItem.classList.remove("dragging");
        
        draggingItem.style.left = "";
        draggingItem.style.top = "";
        draggingItem.style.width = "";
        draggingItem.style.height = "";
        
        if (categoryDropped && draggingItem.dataset.category !== categoryDropped.dataset.category) {
            onItemDrop(draggingItem, categoryDropped);
        } else {
            if (originalNextSibling) {
                originalParent.insertBefore(draggingItem, originalNextSibling);
            } else {
                originalParent.appendChild(draggingItem);
            }
        }

        draggingItem = null;
        originalParent = null;
        originalNextSibling = null;
        offsetX = 0;
        offsetY = 0;
    }
});


// ################################
//       APP INITIALIZATION
// ################################

window.onload = () => {
    getItemStatus();
    loadProfilesUi();
    loadColors();
    loadSearchEndpoint();
    loadSearchBar();
    loadConfigInputState();
};

document.addEventListener("DOMContentLoaded", async () => {
    currentProfile = getDefaultProfile();
    updateDashboard();
});