const socket = io();
document.addEventListener('DOMContentLoaded', function (){
	const input = document.querySelector('#msg')
	const sendButton = document.querySelector('#sendBtn')
	const containerMsg = document.querySelector('#msgContainer')
	
	sendButton.addEventListener('click', () => {
		if (input.value != ' ') {
			socket.emit('outgoing', input.value)
		}
	})
	
	socket.on('incoming', (msg) => {
		const p = document.createElement('p')
		p.innerHTML = msg;
		containerMsg.appendChild(p)
	})
})
