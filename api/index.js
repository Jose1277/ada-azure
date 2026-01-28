// dotenv only needed locally, Azure uses Application Settings
if (process.env.NODE_ENV !== 'production') {
    try { require('dotenv/config'); } catch (e) {}
}

let prisma = null;
function getPrisma() {
    if (!prisma) {
        const { PrismaClient } = require('@prisma/client');
        prisma = new PrismaClient();
    }
    return prisma;
}

module.exports = async function (context, req) {
    const segments = req.params.segments || '';
    const path = '/api/' + segments;
    const method = req.method;

    context.log('Path:', path, 'Method:', method);

    try {
        // GET /api/health
        if (method === 'GET' && path === '/api/health') {
            context.res = {
                status: 200,
                body: { message: 'Okay!!!' },
                headers: { 'Content-Type': 'application/json' }
            };
            return;
        }

        // GET /api/produtos
        if (method === 'GET' && path === '/api/produtos') {
            const produtos = await getPrisma().produto.findMany();
            context.res = { status: 200, body: produtos };
            return;
        }

        // GET /api/produtos/:id
        if (method === 'GET' && path.startsWith('/api/produtos/')) {
            const id = parseInt(segments.split('/')[1]);
            const produto = await getPrisma().produto.findUnique({ where: { id } });
            context.res = { status: 200, body: produto };
            return;
        }

        // POST /api/produtos/:id
        if (method === 'POST' && path.startsWith('/api/produtos/')) {
            const id = parseInt(segments.split('/')[1]);
            const { nome } = req.body;
            const produto = await getPrisma().produto.create({ data: { id, nome } });
            context.res = { status: 201, body: produto };
            return;
        }

        // PUT /api/produtos/:id
        if (method === 'PUT' && path.startsWith('/api/produtos/')) {
            const id = parseInt(segments.split('/')[1]);
            const { nome } = req.body;
            const produto = await getPrisma().produto.update({ where: { id }, data: { nome } });
            context.res = { status: 200, body: produto };
            return;
        }

        // DELETE /api/produtos/:id
        if (method === 'DELETE' && path.startsWith('/api/produtos/')) {
            const id = parseInt(segments.split('/')[1]);
            const produto = await getPrisma().produto.delete({ where: { id } });
            context.res = { status: 200, body: produto };
            return;
        }

        context.res = { status: 404, body: { error: 'Not found' } };
    } catch (error) {
        context.res = { status: 500, body: { error: error.message } };
    }
};
