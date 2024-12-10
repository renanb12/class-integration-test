const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let books = [];
let loans = [];

app.post('/books', (req, res) => {
    const { id, title, author } = req.body;
    if (!id || !title || !author) {
        return res.status(400).json({ message: 'Dados inválidos.' });
    }
    if (books.some(book => book.id === id)) {
        return res.status(400).json({ message: 'Livro já existe.' });
    }
    books.push({ id, title, author, available: true });
    res.status(201).json({ message: 'Livro adicionado com sucesso.' });
});

app.get('/books', (req, res) => {
    res.json(books);
});

app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author } = req.body;
    const book = books.find(book => book.id === id);
    if (!book) {
        return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    if (title) book.title = title;
    if (author) book.author = author;
    res.json({ message: 'Livro atualizado com sucesso.' });
});

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const index = books.findIndex(book => book.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    books.splice(index, 1);
    res.json({ message: 'Livro removido com sucesso.' });
});

app.post('/loans', (req, res) => {
    const { id } = req.body;
    const book = books.find(book => book.id === id);
    if (!book) {
        return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    if (!book.available) {
        return res.status(400).json({ message: 'Livro indisponível.' });
    }
    book.available = false;
    loans.push({ id, date: new Date() });
    res.json({ message: 'Empréstimo realizado com sucesso.' });
});

app.post('/returns', (req, res) => {
    const { id } = req.body;
    const book = books.find(book => book.id === id);
    if (!book) {
        return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    if (book.available) {
        return res.status(400).json({ message: 'Livro já está disponível.' });
    }
    book.available = true;
    loans = loans.filter(loan => loan.id !== id);
    res.json({ message: 'Devolução realizada com sucesso.' });
});

if (require.main === module) {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = { app, books, loans };
