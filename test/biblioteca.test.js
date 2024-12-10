const request = require('supertest');
const { app, books, loans } = require('../src/ex1/biblioteca');

describe('API de Biblioteca', () => {

    beforeEach(() => {
        books.length = 0;
        loans.length = 0;
    });

    it('deve adicionar um novo livro com sucesso', async () => {
        const newBook = { id: '1', title: 'Livro Exemplo', author: 'Autor Exemplo' };

        const response = await request(app)
            .post('/books')
            .send(newBook)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Livro adicionado com sucesso.' });
        expect(books).toHaveLength(1);
        expect(books[0]).toMatchObject(newBook);
    });

    it('deve retornar erro ao tentar adicionar um livro com dados inválidos', async () => {
        const newBook = { title: 'Livro Sem ID', author: 'Autor Exemplo' };

        const response = await request(app)
            .post('/books')
            .send(newBook)
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Dados inválidos.' });
        expect(books).toHaveLength(0);
    });

    it('deve listar os livros cadastrados', async () => {
        books.push({ id: '1', title: 'Livro Exemplo', author: 'Autor Exemplo', available: true });

        const response = await request(app)
            .get('/books')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({ title: 'Livro Exemplo', author: 'Autor Exemplo', available: true });
    });

    it('deve atualizar um livro com sucesso', async () => {
        books.push({ id: '1', title: 'Livro Antigo', author: 'Autor Antigo', available: true });

        const updatedBook = { title: 'Livro Atualizado', author: 'Autor Atualizado' };

        const response = await request(app)
            .put('/books/1')
            .send(updatedBook)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Livro atualizado com sucesso.' });
        expect(books[0]).toMatchObject(updatedBook);
    });

    it('deve excluir um livro com sucesso', async () => {
        books.push({ id: '1', title: 'Livro Exemplo', author: 'Autor Exemplo', available: true });

        const response = await request(app)
            .delete('/books/1')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Livro removido com sucesso.' });
        expect(books).toHaveLength(0);
    });

    it('deve realizar um empréstimo com sucesso', async () => {
        books.push({ id: '1', title: 'Livro Disponível', author: 'Autor Exemplo', available: true });

        const response = await request(app)
            .post('/loans')
            .send({ id: '1' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Empréstimo realizado com sucesso.' });
        expect(books[0].available).toBe(false);
        expect(loans).toHaveLength(1);
    });

    it('deve realizar a devolução de um livro com sucesso', async () => {
        books.push({ id: '1', title: 'Livro Emprestado', author: 'Autor Exemplo', available: false });
        loans.push({ id: '1', date: new Date() });

        const response = await request(app)
            .post('/returns')
            .send({ id: '1' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Devolução realizada com sucesso.' });
        expect(books[0].available).toBe(true);
    });

    it('deve retornar erro ao tentar emprestar um livro indisponível', async () => {
        books.push({ id: '1', title: 'Livro Indisponível', author: 'Autor Exemplo', available: false });
    
        const response = await request(app)
            .post('/loans')
            .send({ id: '1' })
            .expect(400)
            .expect('Content-Type', /json/);
    
        expect(response.body).toEqual({ message: 'Livro indisponível.' });
        expect(books[0].available).toBe(false);
        expect(loans).toHaveLength(0);
    });
    
    
    it('deve retornar erro ao tentar emprestar um livro inexistente', async () => {
        const response = await request(app)
            .post('/loans')
            .send({ id: '999' }) // ID de livro que não existe
            .expect(404)
            .expect('Content-Type', /json/);
    
        expect(response.body).toEqual({ message: 'Livro não encontrado.' });
        expect(loans).toHaveLength(0);
    });    
});
