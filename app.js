import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// server-side (app.js)
const locations = {}; // { socketId: {latitude, longitude} }

io.on('connection', (socket) => {
    // Send all existing locations to the new client
    for (const [id, loc] of Object.entries(locations)) {
        socket.emit('receive-location', { id, ...loc });
    }

    socket.on('sendLocation', (data) => {
        locations[socket.id] = data; // save/update the location
        io.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        delete locations[socket.id];
        io.emit('user-disconnected', socket.id);
    });
});


app.get('/', (req, res) => {
    res.render("index");
});

server.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});