const { ipcRenderer } = require('electron');

// create refresh
document.getElementById('refreshBtn').addEventListener('click', () => {
    ipcRenderer.send('refresh');
});

// on receive data
ipcRenderer.on('load-data', (event, data) => {
    const todoList = document.getElementById('tableBody');

    // create html string
    // set rows html to the items
    todoList.innerHTML = data.reduce((html, datum) => {
        html += `<tr><td>${datum[0]}</td><td>${datum[1]}</td><td>${datum[2]}</td></tr>`;

        return html;
    }, '');
});
