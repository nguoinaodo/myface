// message 
var messagePage = 0;
var isMessageShow = false;
var activeConversation = {};
var activeConversationAvatarUrl = {};
const MESSAGES_PER_PAGE = 8;
const REPLIES_PER_PAGE = 30;

function createChatSidebarFriend(friend) {
	var chatSidebarFriend = document.createElement('div');

	chatSidebarFriend.setAttribute('class', 'chat-sidebar-friend');
	chatSidebarFriend.setAttribute('id', 'chat-sidebar-friend-' + friend.userId);
	chatSidebarFriend.setAttribute('onclick', 'getConversationByUserId(this)');
	chatSidebarFriend.innerHTML = '<div class="chat-sidebar-avatar"><img id="chat-sidebar-avatar-img-' + friend.userId + '" src="' + friend.avatarUrl + '"></div>' +
		' <div class="chat-sidebar-name" id="chat-sidebar-name-' + friend.userId + '">' + friend.displayName + '</div>' +
		' <div class="chat-sidebar-status">&#9679;</div>';

	return chatSidebarFriend;
}

// click on message 
document.getElementById('message-show').addEventListener('click', function() {
	if (isMessageShow) {
		document.getElementById('message-container').style.display = 'none';
		messagePage = 0;
		isMessageShow = false;
	} else {
		document.getElementById('message-count').style.display = 'none';
		getMessages(messagePage);
		isMessageShow = true;	
	}
});

// click on see more messages
document.getElementById('seemore-messages').addEventListener('click', function() {
	seeMoreMessages();
});

// message count
function getMessageCount() {
	ajaxGet('/api/newMessageCount', function(response) {
		var messageCountSpan = document.querySelector('#message-count');
		if (response.data.count === 0) {
			messageCountSpan.style.display = 'none';
		} else {
			messageCountSpan.innerHTML = response.data.count;
			messageCountSpan.style.display = '';
		}
	});	
}

// get messages
function getMessages(page) {
	ajaxGet('/api/conversations?page=' + page, function(response) {
		var conversations = response.data.conversations;
		var messagesDiv = document.getElementById('messages');

		if (page === 0) {
			messages.innerHTML = '';
			document.getElementById('message-container').style.display = '';	
			document.getElementById('seemore-messages').style.display = '';
		}
		if (conversations.length < MESSAGES_PER_PAGE) {
			document.getElementById('seemore-messages').style.display = 'none';
		}
		conversations.forEach(function(conv, i) {
		  // .msg
	      //   .msg-avatar: img(src="http://vnu.com.vn/wp-content/uploads/freshizer/599863026a6b554981d5639361d0a1ed_sarah-570-543-c.jpg" alt="img")
	      //   .msg-contents
	      //     .msg-display-name Luu Hoang
	      //     .msg-datetime 2016 Dec 
	      //     .msg-content Bui Hoang luu nha tin nay
	      	var msgDiv = document.createElement('div');
	      	var msgContentsDiv = document.createElement('div');
	      	var msgAvatarDiv = document.createElement('div');
	      	
	      	msgDiv.setAttribute('class', 'msg');
	      	msgDiv.setAttribute('id', 'msg-' + conv.conId);
	      	msgDiv.setAttribute('onmouseover', 'messageRead(this)');
	      	msgDiv.setAttribute('onclick', 'getConversationByConId(this)');
	      	msgAvatarDiv.setAttribute('class', 'msg-avatar');
	      	msgContentsDiv.setAttribute('class', 'msg-contents');
	      	
	      	msgAvatarDiv.innerHTML = '<img id="msg-avatar-img-' + conv.conId + '" src="' + conv.avatarUrl + '" alt="img">';
	      	msgContentsDiv.innerHTML = '<div class="msg-display-name" id="msg-display-name-' + conv.conId + '">' + conv.displayName + '</div>' +
	      		' <div class="msg-datetime">' + conv.dateTime + '</div>' + 
	      		' <div class="msg-content">' + conv.content + '</div>';
	      	
	      	if (conv.read == 1 || conv.lastFrom == myUserId) {
	      		msgDiv.classList.add('noti-is-read');
	      	}

	      	msgDiv.appendChild(msgAvatarDiv);
	      	msgDiv.appendChild(msgContentsDiv);

	      	messagesDiv.appendChild(msgDiv);
		});
	});
}

// see more messages 
function seeMoreMessages() {
	messagePage++;
	getMessages(messagePage);
}

// message is read
function messageRead(thisObj) {
	if (!thisObj.classList.contains('noti-is-read')) {
		// noti is not read
		thisObj.classList.add('noti-is-read');
		// msg-...
		var conId = Number(thisObj.getAttribute('id').substr(4));
		socket.emit('messageIsRead', {
			conId: conId
		});
	}
}
// get conversation by userId
function getConversationByUserId(thisObj) {
	// chat-sidebar-friend-
	var userId = Number(thisObj.getAttribute('id').substr(20));

	ajaxGet('/api/conversationByUserId/' + userId, (response) => {
		var conId = response.data.conId;

		if (conId) {
			if (!activeConversation[conId]) {
				var displayName = document.getElementById('chat-sidebar-name-' + userId).innerHTML;
				var avatarUrl = document.getElementById('chat-sidebar-avatar-img-' + userId).getAttribute('src');

				var chatBox = document.createElement('div');
				var chatHeader = document.createElement('div');
				var chatHeaderLeft = document.createElement('div');
				var chatHeaderRight = document.createElement('div');
				var chatContent = document.createElement('div');
				var chatInput = document.createElement('div');

				chatBox.setAttribute('class', 'chat-popup');
				chatBox.setAttribute('id', 'chat-popup-' + conId);
				chatHeader.setAttribute('class', 'chat-popup-header');
				chatHeaderLeft.setAttribute('class', 'chat-popup-header-left');
				chatHeaderRight.setAttribute('class', 'chat-popup-header-right');
				chatHeader.setAttribute('onclick', 'toggleChatContent(this)');
				chatHeaderRight.setAttribute('onclick', 'closeChatBox(this)');
				chatContent.setAttribute('class', 'chat-popup-content');
				chatContent.setAttribute('id', 'chat-popup-content-' + conId);
				chatInput.setAttribute('class', 'chat-popup-input');

				chatHeaderLeft.innerHTML = '<span class="chat-popup-header-name">' + displayName + '</span>';
				chatHeaderRight.innerHTML = '<span>X</span>';
				chatInput.innerHTML = '<input type="text" placeholder="Type a message.." autofocus>' +
					' <button class="chat-popup-send-btn" onclick="sendMessage(this)">Send</button>';

				chatHeader.appendChild(chatHeaderRight);
				chatHeader.appendChild(chatHeaderLeft);
				chatBox.appendChild(chatHeader);
				chatBox.appendChild(chatContent);
				chatBox.appendChild(chatInput);

				document.getElementById('container').appendChild(chatBox);
				activeConversation[conId] = true;
				activeConversationAvatarUrl[conId] = avatarUrl;
				
				ajaxGet('/api/conversationByConId/' + conId + '?page=0', (response) => {
					response.data.replies.forEach((reply, i) => {
						chatContent.insertBefore(createReply(reply, avatarUrl), chatContent.firstChild);
					});

					// set position 
					chatContent.scrollTop = chatContent.lastChild.offsetTop;

					if (response.data.replies.length === REPLIES_PER_PAGE) {
						var chatSeemore = document.createElement('div');
						chatSeemore.setAttribute('class', 'chat-popup-seemore');
						chatSeemore.innerHTML = '<span onclick="seeMoreReplies(this)">See more</span>';

						chatContent.insertBefore(chatSeemore, chatContent.firstChild);
						activeConversation[conId] = 1;
					}
				});
			}
		} else {
			var displayName = document.getElementById('chat-sidebar-name-' + userId).innerHTML;
			var avatarUrl = document.getElementById('chat-sidebar-avatar-img-' + userId).getAttribute('src');

			var chatBox = document.createElement('div');
			var chatHeader = document.createElement('div');
			var chatHeaderLeft = document.createElement('div');
			var chatHeaderRight = document.createElement('div');
			var chatContent = document.createElement('div');
			var chatInput = document.createElement('div');

			chatBox.setAttribute('class', 'chat-popup chat-popup-user-' + userId);
			chatHeader.setAttribute('class', 'chat-popup-header');
			chatHeaderLeft.setAttribute('class', 'chat-popup-header-left');
			chatHeaderRight.setAttribute('class', 'chat-popup-header-right');
			chatHeader.setAttribute('onclick', 'toggleChatContent(this)');
			chatHeaderRight.setAttribute('onclick', 'closeChatBox(this)');
			chatContent.setAttribute('class', 'chat-popup-content');
			chatInput.setAttribute('class', 'chat-popup-input');

			chatHeaderLeft.innerHTML = '<span class="chat-popup-header-name">' + displayName + '</span>';
			chatHeaderRight.innerHTML = '<span>X</span>';
			chatInput.innerHTML = '<input type="text" placeholder="Type a message.." autofocus>' +
				' <button class="chat-popup-send-btn" onclick="sendMessage(this)">Send</button>';

			chatHeader.appendChild(chatHeaderRight);
			chatHeader.appendChild(chatHeaderLeft);
			chatBox.appendChild(chatHeader);
			chatBox.appendChild(chatContent);
			chatBox.appendChild(chatInput);

			document.getElementById('container').appendChild(chatBox);
		}
	});	
}
// get conversation by conId
function getConversationByConId(thisObj) {
	// .chat-popup
	//   .chat-popup-header
	//     .chat-popup-header-left
	//       span.chat-popup-header-status &#9679;
	//       span.chat-popup-header-name  Luu Hoang
	//     .chat-popup-header-right
	//       span X
	//   .chat-popup-content
	//     .chat-popup-seemore
	//       span See more 
	//     .chat-popup-reply
	//       img(src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQcfuZBpLEkZdJ7r_XramvmK_fWpWV3ZoMDJQOf2DVYcAfVLjoE-g" alt="img").chat-popup-reply-img-left
	//       .chat-popup-reply-left abcbsbcs
	//     .chat-popup-reply
	//       .chat-popup-reply-right abcbsbcs
	//   .chat-popup-input
	//     input(type="text" placeholder="Type a message..")
	//     button.chat-popup-send-btn Send
	//   .chat-popup-footer

	// msg-..
	var conId = Number(thisObj.getAttribute('id').substr(4));

	if (!activeConversation[conId]) {
		var displayName = document.getElementById('msg-display-name-' + conId).innerHTML;
		var avatarUrl = document.getElementById('msg-avatar-img-' + conId).getAttribute('src');

		var chatBox = document.createElement('div');
		var chatHeader = document.createElement('div');
		var chatHeaderLeft = document.createElement('div');
		var chatHeaderRight = document.createElement('div');
		var chatContent = document.createElement('div');
		var chatInput = document.createElement('div');

		chatBox.setAttribute('class', 'chat-popup');
		chatBox.setAttribute('id', 'chat-popup-' + conId);
		chatHeader.setAttribute('class', 'chat-popup-header');
		chatHeaderLeft.setAttribute('class', 'chat-popup-header-left');
		chatHeaderRight.setAttribute('class', 'chat-popup-header-right');
		chatHeader.setAttribute('onclick', 'toggleChatContent(this)');
		chatHeaderRight.setAttribute('onclick', 'closeChatBox(this)');
		chatContent.setAttribute('class', 'chat-popup-content');
		chatContent.setAttribute('id', 'chat-popup-content-' + conId);
		chatInput.setAttribute('class', 'chat-popup-input');

		chatHeaderLeft.innerHTML = '<span class="chat-popup-header-name">' + displayName + '</span>';
		chatHeaderRight.innerHTML = '<span>X</span>';
		chatInput.innerHTML = '<input type="text" placeholder="Type a message.." autofocus>' +
			' <button class="chat-popup-send-btn" onclick="sendMessage(this)">Send</button>';

		chatHeader.appendChild(chatHeaderRight);
		chatHeader.appendChild(chatHeaderLeft);
		chatBox.appendChild(chatHeader);
		chatBox.appendChild(chatContent);
		chatBox.appendChild(chatInput);

		document.getElementById('container').appendChild(chatBox);
		activeConversation[conId] = true;
		activeConversationAvatarUrl[conId] = avatarUrl;

		ajaxGet('/api/conversationByConId/' + conId + '?page=0', (response) => {
			response.data.replies.forEach((reply, i) => {
				chatContent.insertBefore(createReply(reply, avatarUrl), chatContent.firstChild);
			});

			// set position 
			chatContent.scrollTop = chatContent.lastChild.offsetTop;

			if (response.data.replies.length === REPLIES_PER_PAGE) {
				var chatSeemore = document.createElement('div');
				chatSeemore.setAttribute('class', 'chat-popup-seemore');
				chatSeemore.innerHTML = '<span onclick="seeMoreReplies(this)">See more</span>';

				chatContent.insertBefore(chatSeemore, chatContent.firstChild);
				activeConversation[conId] = 1;
			}
		});
	} else {

	}
		
}

function createReply(reply, avatarUrl) {
	var replyDiv = document.createElement('div');

	replyDiv.setAttribute('class', 'chat-popup-reply');
	if (reply.userId == myUserId) {
		replyDiv.innerHTML = '<div class="chat-popup-reply-right">' + reply.content + '</div>';
	} else {
		replyDiv.innerHTML = '<img src="' + avatarUrl + '" class="chat-popup-reply-img-left">' +
			' <div class="chat-popup-reply-left">' + reply.content + '</div>';
	}

	return replyDiv;
}

function toggleChatContent(thisObj) {

}

function closeChatBox(thisObj) {
	var chatBox = thisObj.parentNode.parentNode;
	if (chatBox.getAttribute('id')) {
		// chat-popup-..
		var conId = Number(chatBox.getAttribute('id').substr(11));

		chatBox.remove();
		activeConversation[conId] = null;
		activeConversationAvatarUrl[conId] = null;	
	} else {
		chatBox.remove();
	}
}

function seeMoreReplies(thisObj, avatarUrl) {
	var chatBox = thisObj.parentNode.parentNode.parentNode;
	var conId = Number(chatBox.getAttribute('id').substr(11));
	var chatContent = thisObj.parentNode.parentNode;

	thisObj.parentNode.remove();

	ajaxGet('/api/conversationByConId/' + conId + '?page=' + activeConversation[conId], (response) => {
		response.data.replies.forEach((reply, i) => {
			if (reply.userId == myUserId) {
				chatContent.insertBefore(createReply(reply), chatContent.firstChild);
			} else {
				chatContent.insertBefore(createReply(reply, activeConversationAvatarUrl[conId]), chatContent.firstChild);
			}
		});

		if (response.data.replies.length === REPLIES_PER_PAGE) {
			var chatSeemore = document.createElement('div');
			chatSeemore.setAttribute('class', 'chat-popup-seemore');
			chatSeemore.innerHTML = '<span onclick="seeMoreReplies(this)">See more</span>';

			chatContent.insertBefore(chatSeemore, chatContent.firstChild);
			activeConversation[conId]++;
		}
	});
}

function sendMessage(thisObj) {
	var chatBox = thisObj.parentNode.parentNode;
	var input = thisObj.parentNode.firstChild;
	var content = thisObj.parentNode.firstChild.value;

	if (chatBox.getAttribute('id')) {
		var conId = Number(chatBox.getAttribute('id').substr(11));
	}

	if (conId) {
		socket.emit('message', {
			conId: conId,
			content: content
		});
	} else {
		// chat-popup-user-..
		var to = Number(chatBox.classList.item(1).substr(16));
		socket.emit('message', {
			content: content,
			to: to
		});
	}
	

	socket.once('sent', (data) => {
		if (data) {
			chatBox.classList.remove('chat-popup-user-' + to);
			chatBox.setAttribute('id', 'chat-popup-' + data.conId)
			var chatContent = chatBox.childNodes[1];
			if (chatContent) {
				chatContent.appendChild(createReply({content: content, userId: myUserId}));	
			}
		} else {
			var chatContent = document.getElementById('chat-popup-content-' + conId);
			if (chatContent) {
				chatContent.appendChild(createReply({content: content, userId: myUserId}));	
			}	
		}
		input.value = '';
		// set position 
		chatContent.scrollTop = chatContent.lastChild.offsetTop;
		input.focus();
	});
}
