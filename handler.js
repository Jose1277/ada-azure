require('dotenv/config');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ message: 'Okay!!!' });
});

app.get('/api/produtos', async (req, res) => {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
});

app.get('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const produto = await prisma.produto.findUnique({
        where: { id: Number(id) }
    });
    res.json(produto);
});

app.post('/api/produtos/:id', async (req, res) => {
    const { nome } = req.body;
    const { id } = req.params;
    const produto = await prisma.produto.create({
        data: { id, nome }
    });
    res.json(produto);
});

app.put('/api/produtos/:id', async (req, res) => {
    const { nome } = req.body;
    const { id } = req.params;
    const produto = await prisma.produto.update({
        where: { id: Number(id) },
        data: { nome }
    });
    res.json(produto);
});

app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const produto = await prisma.produto.delete({
        where: { id: Number(id) }
    });
    res.json(produto);
});

exports.handler = async function (context, req) {
    return new Promise((resolve, reject) => {
        const mockReq = {
            method: req.method,
            url: '/api/' + (req.params.segments || ''),
            params: {},
            body: req.body,
            query: req.query
        };

        const mockRes = {
            statusCode: 200,
            json: function (data) {
                context.res = {
                    status: this.statusCode,
                    body: data,
                    headers: { 'Content-Type': 'application/json' }
                };
                resolve();
            },
            status: function (code) {
                this.statusCode = code;
                return this;
            }
        };

        app(mockReq, mockRes, (err) => {
            if (err) {
                context.res = { status: 500, body: { error: err.message } };
            }
            resolve();
        });
    });
};

exports.prisma = prisma;
