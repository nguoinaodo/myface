// notification
var notiPage = 0;
var isNotisShow = false;
const NOTIS_PER_PAGE = 6;
// friend request
var friendReqNotiPage = 0;
var isFriendReqNotisShow = false;
const REQ_PER_PAGE = 8;

// click on notification 
document.getElementById('noti-show').addEventListener('click', function() {
	if (isNotisShow) {
		document.getElementById('noti-container').style.display = 'none';
		notiPage = 0;
		isNotisShow = false;
	} else {
		document.getElementById('noti-count').style.display = 'none';
		getNotis(notiPage);
		isNotisShow = true;	
	}
});
// click on friend request
document.getElementById('friend-req-show').addEventListener('click', function() {
	if (isFriendReqNotisShow) {
		document.getElementById('friend-req-container').style.display = 'none';
		friendReqNotiPage = 0;
		isFriendReqNotisShow = false;
	} else {
		document.getElementById('friend-req-count').style.display = 'none';
		getFriendReqNotis(friendReqNotiPage);
		isFriendReqNotisShow = true;
	}
});
// click on see more notifications
document.getElementById('seemore-notis').addEventListener('click', function() {
	seeMoreNotis();
});
// click on see more notifications
document.getElementById('seemore-friend-reqs').addEventListener('click', function() {
	seeMoreFriendReqs();
});
// notification count
function getNotiCount() {
	ajaxGet('/api/getNotiCount', function(response) {
		var notiCountSpan = document.querySelector('#noti-count');
		if (response.data.count === 0) {
			notiCountSpan.style.display = 'none';
		} else {
			notiCountSpan.innerHTML = response.data.count;
			notiCountSpan.style.display = '';
		}
	});	
}
// friend request count
function getFriendReqNotiCount() {
	ajaxGet('/api/getFriendReqNotiCount', function(response) {
		var friendReqCountSpan = document.querySelector('#friend-req-count');
		if (response.data.count === 0) {
			friendReqCountSpan.style.display = 'none';	
		} else {
			friendReqCountSpan.innerHTML = response.data.count;
			friendReqCountSpan.style.display = '';	
		}
		
	});
}
// get notifications
function getNotis(page) {
	ajaxGet('/api/getNotis?page=' + page, function(response) {
		var notis = response.data.notis;
		var notisDiv = document.getElementById('notis');
		
		if (page === 0) {
			notisDiv.innerHTML = '';
			document.getElementById('noti-container').style.display = '';
			document.getElementById('seemore-notis').style.display = '';
		}
		if (notis.length < NOTIS_PER_PAGE) {
			document.getElementById('seemore-notis').style.display = 'none';
		} 
		notis.forEach(function(noti, i) {
			var notiContent = '';
			var href = '/post/' + noti.postId;
			if (noti.actionCode === 0) {
				// like
				if (noti.count > 1) {
					notiContent = '<b>' + noti.displayName + '</b> and ' + (noti.count - 1) + ' others like your post.';
				} else {
					notiContent = '<b>' + noti.displayName + '</b> like your post.';
				}
			} else if (noti.actionCode === 1) {
				// comment
				if (noti.count > 1) {
					notiContent = '<b>' + noti.displayName + '</b> and ' + (noti.count - 1) + ' others comment on your post.';
				} else {
					notiContent = '<b>' + noti.displayName + '</b> comments on your post.';
				}
			} else if (noti.actionCode === 2) {
				// post on wall
				if (noti.count > 1) {
					notiContent = '<b>' + noti.displayName + '</b> and ' + (noti.count - 1) + ' others post on your timeline.';
				} else {
					notiContent = '<b>' + noti.displayName + '</b> posts on your timeline.';
				}
			}
			var html = '<a href="' + href + '"><div class="noti-avatar"><img alt="img" src="' + noti.avatarUrl + '"></div>' 
				+ '<div class="noti-content">' + notiContent + '</div></a>'; 
			var notiDiv = document.createElement('div');
			notiDiv.setAttribute('class', 'noti');
			notiDiv.setAttribute('id', 'noti-' + noti.notiId);
			notiDiv.setAttribute('onmouseover', 'notiRead(this);');
			if (noti.read) {
				notiDiv.classList.add('noti-is-read');
			}
			notiDiv.innerHTML = html;
			notisDiv.appendChild(notiDiv);
		});
	});
}
// get friend requests notification
function getFriendReqNotis(page) {
	ajaxGet('/api/getFriendReqNotis?page=' + page, function(response) {
		var friendReqNotis = response.data.friendReqNotis;
		var friendReqsDiv = document.getElementById('friend-reqs');

		if (page === 0) {
			friendReqsDiv.innerHTML = '';
			document.getElementById('friend-req-container').style.display = '';	
			document.getElementById('seemore-friend-reqs').style.display = '';
		}
		if (friendReqNotis.length < REQ_PER_PAGE) {
			document.getElementById('seemore-friend-reqs').style.display = 'none';
		}
		friendReqNotis.forEach(function(noti, i) {
			var notiContent = '';
			var href = '/user/' + noti.from;
			if (noti.actionCode === 3) {
				// friend request
				notiContent = '<a href="' + href + '"><b class="friend-req-displayName">' + noti.displayName + '</b></a>'
					+ ' <button class="right friend-req-del" onclick="friendReqNotiDelete(this, ' 
					+ noti.from + ');">Delete request</button>'
					+ ' <button class="friend-req-confirm right" onclick="friendReqNotiConfirm(this, ' 
					+ noti.from + ');">Confirm</button>';				
			} else if (noti.actionCode === 4) {
				// friend request accepted
				notiContent = '<a href="' + href + '"><b class="friend-req-displayName">' + noti.displayName + '</b></a>'
					+ ' has accepted your friend request.'
			}
			var html = '<div class="noti-avatar"><img alt="img" src="' + noti.avatarUrl + '"></div>' 
				+ '<div class="noti-content">' + notiContent + '</div>'; 
			var friendReqNotiDiv = document.createElement('div');
			friendReqNotiDiv.setAttribute('class', 'noti');
			friendReqNotiDiv.setAttribute('id', 'friend-req-noti-' + noti.friendReqId);
			friendReqNotiDiv.setAttribute('onmouseover', 'friendReqNotiRead(this);');
			if (noti.read) {
				friendReqNotiDiv.classList.add('noti-is-read');
			}
			friendReqNotiDiv.innerHTML = html;
			friendReqsDiv.appendChild(friendReqNotiDiv);
		});
	});
}
// see more notifications
function seeMoreNotis() {
	notiPage++;
	getNotis(notiPage);
}
// see more friend requests
function seeMoreFriendReqs() {
	friendReqNotiPage++;
	getFriendReqNotis(friendReqNotiPage);
}
// confirm request on notification
function friendReqNotiConfirm(thisObj, userId) {
	var postData = 'userId=' + userId;
	var href = '/user/' + userId;
	ajaxPost('/api/acceptRequest', postData, function(response) {
		if (response.errCode == 0) {
			var notiContentDiv = thisObj.parentNode;
			var displayName = '';
			notiContentDiv.innerHTML = '<a href="' + href + '"><b class="friend-req-displayName">' + displayName + '</b></a>'
				+ '<p>Request accepted</p>';
		}
	});
}
// delete request on notification
function friendReqNotiDelete(thisObj, userId) {
	var postData = 'userId=' + userId;
	var href = '/user/' + userId;
	ajaxPost('/api/deleteRequest', postData, function(response) {
		if (response.errCode == 0) {
			var notiContentDiv = thisObj.parentNode;
			var displayName = '';
			notiContentDiv.innerHTML = '<a href="' + href + '"><b class="friend-req-displayName">' + displayName + '</b></a>'
				+ '<p>Request deleted</p>';
		}
	});
}
// notification has been read
function notiRead(thisObj) {
	if (!thisObj.classList.contains('noti-is-read')) {
		// noti is not read
		thisObj.classList.add('noti-is-read');
		socket.emit('notiIsRead', {
			// noti-
			notiId: Number(thisObj.getAttribute('id').substr(5))
		});
	}
}
// friend request notification has been read
function friendReqNotiRead(thisObj) {
	if (!thisObj.classList.contains('noti-is-read')) {
		// noti is not read
		thisObj.classList.add('noti-is-read');
		socket.emit('friendReqNotiIsRead', {
			// friend-req-noti-
			friendReqId: Number(thisObj.getAttribute('id').substr(16))
		});
	}
}
