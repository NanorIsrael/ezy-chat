let allUsers = [];
const users = []

class UserController {
	static
	createUser( username, password, socket) {
		console.log('pass', username, password)

		// Implement user registration logic here
		if (isValidUsername(username) && isValidPassword(password)) {
			const hashedPassword = Buffer.from(password.trim()).toString('base64')
			users.push({
				username,
				password: hashedPassword
			})			
			const token = Buffer.from(username).toString('base64');
			socket.emit('registrationSuccess', { username, token });
		} else {
			// Emit a failure event to the client
			socket.emit('registrationFailure', { message: 'Invalid username or password' });
		}
	}

	static
	isValidUser(username, password) {
		if (isValidUsername(username) && isValidPassword(password)) {
			const userInfo = users.filter(user => user.username == username)
			const hashedPassword = Buffer.from(password.trim()).toString('base64')

			return String(userInfo[0].password) === hashedPassword
		}
		return null
	}
}
function isValidUsername(username) {
	return username && username !== ''
}
function isValidPassword(password) {
	return password && password !== '' 
}

function authorizeUser(socket, next) {
	console.log('==============> userlogin event emitted')

	const authHeader = socket.handshake.headers.authorization;
	if (!authHeader) {
		console.log('userlogin event emitted')

		return socket.emit('userlogin', {message: 'auth header does not exist'});		;
	}
	const token = authHeader.split(' ')[1];
	const { username, password }  = Buffer.from(token, 'base64').toString()
	// Perform authentication logic here
	if (UserController.isValidUser(username, password)) {
		console.log('userlogin event emitted')

		return (socket.emit({message: 'userlogin', success: true}));
	} else {
		console.log('userlogin event emitted')
		return socket.emit('userlogin', {
			message: 'username and password does not match',
			success: false
		});
	}
}

module.exports = {UserController, authorizeUser, allUsers, users};