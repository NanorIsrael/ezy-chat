const express = require('express');
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const cors = require('cors');

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, { cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },})

const users = []
// const password
app.get('/', (req, res) => {
	res.sendFile('index.html')
})
app.post('/signup', (req, res) => {
	 const { email, password } = req.body

	 if (!email || !password) {
		return res.status(400).json({error: `${email ? 'password' : 'email'} missing`})
	 }
	 const userInfo = users.filter(user => user.email === email);
	 if (userInfo.length) {
		return res.status(400).json({error: `email already exists`})
	 }

	 const hashedPassword = Buffer.from(password.trim()).toString('base64')
	 console.log('pass', hashedPassword)
	 users.push({
		email,
		password: hashedPassword
	 })
	 return res.status(201).json({
		email: email
	 });
})

app.post('/signin', (req, res) => {
	 const { email, password } = req.body

	 if (!email || !password) {
		return res.status(400).json({error: `${email ? 'password' : 'email'} missing`})
	 }
	 const userInfo = users.filter(user => user.email === email);
	 if (!userInfo.length) {
		return res.status(401).json({error: `user not found`})
	 }

	 const hashedPassword = Buffer.from(password.trim()).toString('base64')

	 if (String(userInfo[0].password) === hashedPassword) {
		const token = Buffer.from(email).toString('base64');

		const CHAT_BOT = 'ChatBot';
		// Add this
		let chatRoom = '';
		let allUsers = [];
		let db = [];
		io.on('connection', (socket) => {
		  console.log(`User connected ${socket.id}`);
		
		  // Add a user to a room
		  socket.on('join_room', (data) => {
			const { username, room } = data; // Data sent from client when join_room event emitted
			socket.join(room); // Join the user to a socket room
		
			socket.emit('last_100_messages', db);
		
			 // Add this
			 let __createdtime__ = Date.now(); // Current timestamp
			 // Send message to all users currently in the room, apart from the user that just joined
			 socket.to(room).emit('receive_message', {
			   message: `${username} has joined the chat room`,
			   username: CHAT_BOT,
			   __createdtime__,
			 });
		
			  // Add this
		 // Send welcome msg to user that just joined chat only
			socket.emit('receive_message', {
				message: `Welcome ${username}`,
				username: CHAT_BOT,
				__createdtime__,
			});
		
			console.log('chat room', socket.rooms)
		
			chatRoom = room;
			allUsers.push({ id: socket.id, username, room });
			chatRoomUsers = allUsers.filter((user) => user.room === room);
			socket.to(room).emit('chatroom_users', chatRoomUsers);
			console.log('chat room user', chatRoomUsers)
			socket.emit('chatroom_users', chatRoomUsers);
		  });
		
		
		// Add this
		
		  socket.on('disconnect', () => {
			console.log('🔥: A user disconnected');
		  });
		});
		return res.status(200).json({
			token 
	 	});
	 } else {
		return res.status(401).json({
			error: 'login failed'
		 });
	 }
})



server.listen(4000, () => {
	console.log('Socket server running')
})
