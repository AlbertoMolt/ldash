const itemsContainer = document.getElementById('itemsContainer');

const contextMenu = document.getElementById('contextMenu');

const deleteItemDialog = document.getElementById('deleteItemDialog');
const editItemDialog = document.getElementById('editItemDialog');

const createItemDialog = document.getElementById('createItemDialog');

const configDialog = document.getElementById('configDialog');
const createProfileDialog = document.getElementById('createProfileDialog');

const selectedProfile = document.getElementById('selectedProfile');
const defaultProfile = document.getElementById('defaultProfile');

const enablePingStatus = document.getElementById('enablePingStatus');


// GLOBAL VARs
let currentMouseX = 0;
let currentMouseY = 0;

let itemid = 0;

let currentProfile = "";


// Mantener las coordenadas actualizadas
document.addEventListener('mousemove', function(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
});

document.getElementById('configBtn').addEventListener('click', function(){
    loadProfilesForConfig();
    configDialog.showModal();
});

//################################
//          DELETE ITEM
//################################
document.getElementById('deleteItemBtn').addEventListener('click', function(){
    deleteItemDialog.showModal();

    getItemData()
    .then(item => {
        deleteItemDialog.innerHTML = `
            <h2>Delete "${item.name}"</h2>
            <p>Are you sure?<p>
            <button type="button" id="confirmDelete" onclick="deleteItem()" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
            <button type="button" id="cancelDelete" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
        `
    })
    .catch(err => alert(err));
});

function deleteItem(){
    fetch(`/api/items/${itemid}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            deleteItemDialog.close();
            updateDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    })
}

//################################
//           EDIT ITEM
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

                    const itemType = item.item_type;

                    switch (itemType) {
                        case "item":
                            editItemDialog.innerHTML = `
                                <div class="edit-item-wrapper dialog-wrapper" style="font-family: sans-serif; padding: 20px; color: white; border-radius: 8px;">
                                    <h2 style="margin-top: 0; border-bottom: 1px solid #ffffffff; padding-bottom: 10px;">Edit "${item.name}"</h2>
                                    
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
                                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Icon URL</label>
                                            <div style="display: flex; gap: 10px; align-items: center;">
                                                <input type="text" id="itemIcon" value="${item.icon}" style="flex-grow: 1; padding: 8px;">
                                                <div style="background: #0b1021; padding: 5px; border-radius: 4px; display: flex; align-items: center;">
                                                    <img src="${item.icon}" 
                                                        id="iconPreview" 
                                                        width="30px" 
                                                        height="30px" 
                                                        style="object-fit: contain;">
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
        
                                    <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                                        <button type="button" id="applyItemBtn" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Apply</button>
                                        <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Cancel</button>
                                    </div>
                                </div>
                            `;
                            break;
                        case "iframe":
                            editItemDialog.innerHTML = `
                                <div class="edit-item-wrapper dialog-wrapper" style="font-family: sans-serif; padding: 20px; color: white; border-radius: 8px;">
                                    <h2 style="margin-top: 0; border-bottom: 1px solid #ffffffff; padding-bottom: 10px;">Edit ${item.name}</h2>
                                    
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
        
                                        <div id="newCategoryWrapperEdit" style="display: none; background: #0b1021; padding: 10px; border-radius: 4px;">
                                            <label style="display: block; margin-bottom: 5px;">New category name</label>
                                            <input type="text" id="newCategoryEdit" style="width: 100%; padding: 8px; box-sizing: border-box;">
                                        </div>
                                    </div>
        
                                    <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                                        <button type="button" id="applyItemBtn" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Apply</button>
                                        <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Cancel</button>
                                    </div>
                                </div>
                            `;
                            break;
                    }


                    const itemCategoryEdit = document.getElementById('itemCategoryEdit');
                    const newCategoryWrapperEdit = document.getElementById('newCategoryWrapperEdit');
                    const newCategoryEdit = document.getElementById('newCategoryEdit');
                    let selectedCategory = item.category; // De forma predeterminada, se le da el valor de la categoría vieja del item
                    
                    if (itemCategoryEdit) {
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

                                applyChanges(
                                    document.getElementById('itemNameEdit').value,
                                    "item",
                                    document.getElementById('itemIcon').value, 
                                    document.getElementById('itemUrlEdit').value,
                                    finalCategory,
                                    document.getElementById('openingMethodEdit').value
                                );
                                break;
                            case "iframe":
                                applyChanges(
                                    document.getElementById('itemNameEdit').value,
                                    "iframe",
                                    "",
                                    document.getElementById('itemUrlEdit').value,
                                    "",
                                    "",
                                );
                                break;
                        }
                        
                        editItemDialog.close();
                        });
                    }
                })
                .catch(err => alert(err));
        })
        .catch(err => alert(err));
});

function applyChanges(name, item_type, icon, url, category, tab_type){
    if (itemid != 0) {
        fetch(`/api/items/${itemid}`, {
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

//################################
//         CREATE ITEM
//################################
document.getElementById("createItemBtn").addEventListener('click', function(){
    createItemDialog.showModal();

    getItemCategories()
        .then(itemCategories => {
            const categoryOptions = itemCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

            createItemDialog.innerHTML = `
                <div class="create-item-wrapper dialog-wrapper" style="font-family: sans-serif; padding: 20px; color: white; border-radius: 8px;">
                    <h2 id="createItemTitle" style="margin-top: 0; border-bottom: 1px solid #ffffffff; padding-bottom: 10px;">Create item</h2>

                    <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">

                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Type</label>

                            <input type="radio" id="item-type-item" name="radio-item-type" value="item" required checked>
                            <label for="item-type-item">Item</label>

                            <input type="radio" id="item-type-iframe" name="radio-item-type" value="iframe">
                            <label for="item-type-iframe">Iframe</label>
                        </div>
                        
                        <div">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                            <input type="text" id="itemNameCreate" placeholder="Item name..." style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>

                        <div id="iconURLWrapperCreate">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Icon URL</label>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="text" id="itemIcon" placeholder="https://..." style="flex-grow: 1; padding: 8px;">
                                <div style="background: #0b1021; padding: 5px; border-radius: 4px; display: flex; align-items: center; min-width: 30px; min-height: 30px;">
                                    <img src="/static/preview-icon.png" 
                                        id="iconPreview" 
                                        width="30px" 
                                        height="30px" 
                                        style="object-fit: contain;">
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

                    <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" id="createItemBtnDialog" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-weight: bold;">Create</button>
                        <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Cancel</button>
                    </div>
                </div>
            `;

            const itemTypeItem = document.getElementById('item-type-item');
            const itemTypeIframe = document.getElementById('item-type-iframe');

            const itemCategoryCreate = document.getElementById('itemCategoryCreate');
            const newCategoryWrapperCreate = document.getElementById('newCategoryWrapperCreate');
            const newCategoryCreate = document.getElementById('newCategoryCreate');
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
                        newCategoryWrapperCreate.style.position = "static";
                        selectedCategory = newCategoryCreate.value;
                    } else {
                        newCategoryWrapperCreate.style.display = "none";
                        newCategoryWrapperCreate.style.position = "fixed";
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
            id: '0', // Temporal id
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
function getItemData() {
    return fetch(`/api/items/${itemid}`, {
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

    configDialog.close();

    createProfileDialog.close();
}
//---------------------------------

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
        itemsContainer.innerHTML = "<p>No items were found in this profile. Create an item to use.</p>";
        return;
    }

    const regularItems = filteredItems.filter(item => item.item_type === "item");
    const otherItems = filteredItems.filter(item => item.item_type !== "item");

    const itemsWithCategory = regularItems.filter(item => item.category);
    const itemsWithoutCategory = regularItems.filter(item => !item.category);

    if (itemsWithoutCategory.length > 0) {
        html.push(`
            <div class="category" category="uncategorized">
                <div class="category-title">
                    <p>➤</p>
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
    
    const categoriesToShow = categories.filter(category => 
        categoriesWithItems.includes(category)
    );

    for (const category of categoriesToShow) {
        const categoryItems = itemsWithCategory.filter(item => item.category === category);
        
        if (categoryItems.length > 0) {
            html.push(`
                <div class="category" category="${category}">
                    <div class="category-title">
                        <p>➤</p>
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
            return `
                <div class="item" itemid="${item.id}">
                    <a href="${item.url}" target="${target}">
                        <div class="content-wrapper">
                            <p>${item.name}</p>
                            <img class="item-icon" src="${item.icon}" alt="${item.name} icon" loading="lazy">
                        </div>
                    </a>
                    <span class="status-ping" id="statusPing">•</span>
                </div>
            `;
        
        case "iframe":
            return `
                <div class="iframe-item" itemid="${item.id}">
                    <div class="iframe-header">
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

    console.log(currentProfile)
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
    const selectedProfileElement = document.querySelector('#selectedProfile');
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
    const defaultProfileElement = document.querySelector('#defaultProfile');
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
    const createProfileInput = document.getElementById("createProfile");
    currentProfile = createProfileInput.value;

    createProfileDialog.close();
    updateDashboard();
}

selectedProfile.addEventListener('change', async () =>{
    if (selectedProfile.value === "newProfile") {
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
    // Render status
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

    loadProfilesUi()
};

document.addEventListener("DOMContentLoaded", async () => {
    currentProfile = getDefaultProfile();
    updateDashboard()
});
