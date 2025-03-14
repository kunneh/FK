// script.js

document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');

    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-text">${taskText}</span>
                <button class="delete-button">Delete</button>
            `;
            taskList.appendChild(li);
            taskInput.value = '';

            const taskSpan = li.querySelector('.task-text');
            taskSpan.addEventListener('click', function() {
                taskSpan.classList.toggle('completed');
            });

            const deleteButton = li.querySelector('.delete-button');
            deleteButton.addEventListener('click', function() {
                li.remove();
            });
        }
    }
});