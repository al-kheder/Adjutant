const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let tasks = [];

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/tasks', (req, res) => {
    tasks.push(req.body);
    res.send(`Task added successfully!`);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
