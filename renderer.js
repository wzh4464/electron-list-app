async function loadItems() {
    const items = await window.electron.invoke('get-items');
    console.log('Loaded items:', items);  // Debug log
    items.forEach(item => {
        addItemToTable(item);
    });
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
    const item = {
        title: document.getElementById('title-input').value,
        author: document.getElementById('author-input').value,
        type: document.getElementById('type-input').value,
        year: document.getElementById('year-input').value,
        publication: document.getElementById('publication-input').value,
        citationkey: document.getElementById('citationkey-input').value
    };
    console.log('New item:', item);  // Debug log
    addItemToTable(item);
}

async function saveItems() {
    const items = getTableItems();
    console.log('Saving items:', items);  // Debug log
    await window.electron.invoke('save-items', items);
    console.log('Items saved successfully');  // Debug log
}

function exitApp() {
    window.close();
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

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-item-btn');
    const saveButton = document.getElementById('save-btn');
    const exitButton = document.getElementById('exit-btn');

    addButton.addEventListener('click', addItem);
    saveButton.addEventListener('click', saveItems);
    exitButton.addEventListener('click', exitApp);

    loadItems();
});