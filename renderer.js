async function loadItems() {
    try {
        const items = await window.electron.invoke('get-items');
        console.log('Loaded items:', items);  // Debug log
        items.forEach(item => {
            addItemToTable(item);
        });
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function addItemToTable(item) {
    const table = document.getElementById('items-table');
    const row = table.insertRow();

    const titleCell = row.insertCell(0);
    const authorCell = row.insertCell(1);
    const typeCell = row.insertCell(2);
    const yearCell = row.insertCell(3);
    const publicationCell = row.insertCell(4);
    const citationKeyCell = row.insertCell(5);

    titleCell.textContent = item.title;
    authorCell.textContent = item.author;
    typeCell.textContent = item.type;
    yearCell.textContent = item.year;
    publicationCell.textContent = item.publication;
    citationKeyCell.textContent = item.citationkey;
}

function addItem() {
    console.log('Add item function called');  // Debug log
    const titleInput = document.getElementById('title-input');
    const authorInput = document.getElementById('author-input');
    const typeInput = document.getElementById('type-input');
    const yearInput = document.getElementById('year-input');
    const publicationInput = document.getElementById('publication-input');
    const citationKeyInput = document.getElementById('citationkey-input');

    const item = {
        title: titleInput.value,
        author: authorInput.value,
        type: typeInput.value,
        year: yearInput.value,
        publication: publicationInput.value,
        citationkey: citationKeyInput.value
    };
    console.log('New item:', item);  // Debug log
    addItemToTable(item);

    // Clear input fields
    titleInput.value = "";
    authorInput.value = "";
    typeInput.value = "";
    yearInput.value = "";
    publicationInput.value = "";
    citationKeyInput.value = "";
}

async function saveItems() {
    const items = getTableItems();
    console.log('Saving items:', items);  // Debug log
    await window.electron.invoke('save-items', items);
    console.log('Items saved successfully');  // Debug log
}

function exitApp() {
    saveItems();
    window.electron.send('app-quit');
}

function getTableItems() {
    const table = document.getElementById('items-table');
    const items = [];
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const item = {
            title: row.cells[0].textContent,
            author: row.cells[1].textContent,
            type: row.cells[2].textContent,
            year: row.cells[3].textContent,
            publication: row.cells[4].textContent,
            citationkey: row.cells[5].textContent
        };
        items.push(item);
    }
    return items;
}

document.getElementById("add-item-btn").addEventListener("click", addItem);

window.addEventListener('DOMContentLoaded', () => {
    loadItems();

    document.getElementById('save-btn').addEventListener('click', () => {
        saveItems();
    });

    document.getElementById('exit-btn').addEventListener('click', () => {
        exitApp();
    });

    window.electron.receive('app-close', () => {
        exitApp();
    });
});

// 将 getTableItems 函数暴露在 window 对象上
window.getTableItems = getTableItems;

// clearTable 函数用于清空表格
function clearTable() {
    const table = document.getElementById('items-table');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}

