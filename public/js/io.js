function ioConnect() {
    socket = io.connect();

    socket.on('connect', function() {
        console.log('Connect to socket');
        socket.emit('auth', {
            token: myToken,
            userId: myUserId
        });    
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnect socket');
    });

    socket.on('welcome', function() {
        console.log('Successfully authenticated socket'); 
    });    

    // notification
    var notiCountSpan = document.getElementById('noti-count');
    var friendReqCountSpan = document.getElementById('friend-req-count');

    socket.on('like', function(data) {
        getNotiCount();
    }); 

    socket.on('comment', function(data) {
        getNotiCount();
    }); 

    socket.on('postOnWall', function(data) {
        getNotiCount();    
    });

    socket.on('friendRequest', function(data) {
        getFriendReqNotiCount();
    });

    socket.on('friendRequestAccepted', function(data) {
        getFriendReqNotiCount();
    });

    socket.on('message', (data) => {
        getMessageCount();
        console.log('message')
        console.log(data)
        if (activeConversation[data.conId]) {
            document.getElementById('chat-popup-content-' + data.conId).appendChild(createReply({
                content: data.content,
                userId: data.from
            }, data.avatarUrl));
        }
    });
    
    // chat
    
    // request chat list
    socket.emit('requestChatList');
    console.log('requestChatList')

    // get chat list
    socket.on('chatList', (data) => {
        console.log('chat list');
        console.log(data);
        // .chat-sidebar
        //   .chat-sidebar-friend
        //     .chat-sidebar-avatar: img(src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQcfuZBpLEkZdJ7r_XramvmK_fWpWV3ZoMDJQOf2DVYcAfVLjoE-g" alt="img")
        //     .chat-sidebar-name Bui Hoang Luu
        //     .chat-sidebar-status &#9679;
        //   .chat-sidebar-friend
        //     .chat-sidebar-avatar: img(src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQcfuZBpLEkZdJ7r_XramvmK_fWpWV3ZoMDJQOf2DVYcAfVLjoE-g" alt="img")
        //     .chat-sidebar-name Bui Hoang Luu
        //     .chat-sidebar-status &#9679;
        var chatSidebar = document.createElement('div');

        chatSidebar.setAttribute('class', 'chat-sidebar');
        data.online.forEach((friend, i) => {
            chatSidebar.appendChild(createChatSidebarFriend(friend));
        }); 

        document.getElementById('container').appendChild(chatSidebar);
    });

    socket.on('goOnline', (data) => {
        console.log('goOnline')
        console.log(data)
        var chatSidebar = document.querySelector('.chat-sidebar');

        chatSidebar.appendChild(createChatSidebarFriend(data));
    });

    socket.on('goOffline', (data) => {
        console.log('goOffline')
        console.log(data)
        document.getElementById('chat-sidebar-friend-' + data.userId).remove();
    });

}


