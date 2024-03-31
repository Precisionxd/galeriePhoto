// Importăm modulul http pentru a crea serverul
const http = require('http');
const fs = require('fs'); // Modulul fs (file system) este folosit pentru a citi fișiere

// Definim portul pe care serverul nostru va asculta
const port = process.env.PORT || 3016;

// Creăm un server HTTP
const server = http.createServer((req, res) => {
    // Citim fișierul HTML
    fs.readFile('index.html', (err, data) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data); // Trimitem conținutul fișierului HTML către client
        }
    });
});

// Ascultăm pe portul definit și afișăm un mesaj când serverul este pornit
server.listen(port, () => {
    console.log(`Serverul rulează la adresa http://localhost:${port}/`);
});

//comm
