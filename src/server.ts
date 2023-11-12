import { createServer, Server, ServerResponse } from 'http';

const PORT = 4200 || process.env.PORT;

const server: Server = createServer((request, response: ServerResponse) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello World!\n');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});