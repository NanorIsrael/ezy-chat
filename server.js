const express = require('express');
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile('index.html')
})
io.on('connection', (socket) => {
	console.log('client connected')
	socket.on('outgoing', (msg) => {
		io.emit('incoming', msg)
	})
})
http.listen(1245, () => {
	console.log('Socket server running')
})
app.listen(9000, () => {
	console.log('Http Server running')
})