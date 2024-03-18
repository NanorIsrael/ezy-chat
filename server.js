const express = require('express');
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const cors = require('cors');


const {UserController, authorizeUser, allUsers, users} = require('./controllers/User');

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, { cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },})

// const password
app.get('/', (req, res) => {
	console.log(']]]]]]]]]]]]]]]]]]]]======>')
	res.sendFile('index.html')
})
// io.on('connection', (socket) => {
// 	socket.on('register', ({username, password}) => UserController.createUser(username, password, socket));
// 	socket.on('disconect', () => null);
// })
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
	//    socket.emit('registrationSuccess', { username, token });
	return res.status(200).json({
		email,
		token
	})

	} else {
		return res.status(401).json({error: `Invalid username and password`})
	}
})
const CHAT_BOT = 'ChatBot';
// Add this
let chatRoom = '';
let db = [];

// io.use((socket, next) => {
// 	const authHeader = socket.handshake.headers.authorization;
// 	console.log(socket.handshake.headers.authorization)
// 	if (!authHeader) {
// 		console.log('userlogin event emitted== auth header does not exist')
// 		// socket.on('register', ({username, password}) => UserController.createUser(username, password, socket));

// 		return socket.emit('userlogin', {message: 'auth header does not exist'});		;
// 	} else {
// 		const token = authHeader.split(' ')[1];
// 		const { username, password }  = Buffer.from(token, 'base64').toString()
// 		// Perform authentication logic here
// 		if (UserController.isValidUser(username, password)) {
// 			console.log('userlogin event emitted =>')
	
// 			socket.emit({message: 'userlogin', success: true});
// 			next()
// 		} else {
// 			console.log('userlogin event emitted ===>')
// 			return socket.emit('userlogin', {
// 				message: 'username and password does not match',
// 				success: false
// 			});
// 			// socket.on('register', ({username, password}) => UserController.createUser(username, password, socket));
	
// 		}
// 	}
// })
io.on('connection', (socket) => {

//   socket.on('register', ({username, password}) => UserController.createUser(username, password, socket));

	socket.on('join_room', (data) => {
		// console.log('user rom info', username, room)

		const { username, room } = data;
		console.log('user rom info', username, room)
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
		  console.log('chat room user', username)
	
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


  socket.on('disconnect', () => {
	console.log('🔥: A user disconnected');
  });

});
// return res.status(200).json({
// 	token 
//  });

server.listen(4000, () => {
	console.log('Socket server running')
})
