// my info
var myUserId;
var myToken;
// user info
var userId = Number(window.location.pathname.substr(6));
var avatarUrl = '',
    coverUrl = '';
var postIds = [];
    
ready(main);

function main() {
    var newsfeedDiv = document.getElementById('newsfeed');
    var aboutDiv = document.getElementById('about');
    var profileAvatar = document.querySelector('.profile-avatar img');
    var profileCoverDiv = document.querySelector('.profile-cover');
    var friendzoneDiv = document.querySelector('.profile-friendzone');
    var friendzoneBtn = document.querySelector('#friendzone-btn');
    
    newsfeedDiv.innerHTML = '';
    // get my info
    ajaxGet('/api/myInfo', function(response) {
        var data = response.data;
        myUserId = data.userId;
        myToken = data.token;
        // connect socket
        ioConnect();
        
        // get user info
        ajaxGet('/api/getUserInfo/' + userId, function(response) {
            var data = response.data;
            
            avatarUrl = data.avatar? data.avatar.url: '';
            coverUrl = data.cover? data.cover.url: '';
            document.querySelector('.profile-name span').innerHTML = data.info.displayName;
            
            // friend button
            switch(data.relationship.statusCode) {
                case -2: // not found
                    friendzoneBtn.innerHTML = 'Add friend';
                    friendzoneBtn.setAttribute('onclick', 'addFriend(this);');
                    break;
                case -1: // is me
                    friendzoneDiv.removeChild(friendzoneBtn);
                    break;
                case 0: // pending and not me
                    if (data.relationship.actionId === userId) {
                        // if this user is the one who send the friend request
                        friendzoneBtn.innerHTML = 'Respond to Friend Request';
                        friendzoneBtn.addEventListener('click', function() {
                            this.style.display = 'none';
                            friendzoneDiv.innerHTML += '<button id="acceptRequestBtn" class="friendzone-btn right" onclick="acceptRequest(this);">Accept request</button>';
                            friendzoneDiv.innerHTML += '<button id="deleteRequestBtn" class="friendzone-btn right" onclick="deleteRequest(this);">Delete request</button>';
                        });
                    } else {
                        friendzoneBtn.innerHTML = 'Cancel request';
                        friendzoneBtn.setAttribute('onclick', 'cancelRequest(this);');   
                    }
                    break;
                case 1: // accepted
                    friendzoneBtn.innerHTML = 'Unfriend';
                    friendzoneBtn.setAttribute('onclick', 'unfriend(this);');
                    break;
                default: 
                    friendzoneDiv.removeChild(friendzoneBtn);
                    break;
            }
            
            // about
            aboutDiv.innerHTML = '<h3>Intro</h3><br>' + '<p>From ' + data.info.from +'</p>'
                + '<p>Lives in ' + data.info.livesIn + '</p>'
                + '<p>Birthday: ' + new Date(data.info.birthday).toDateString() + '</p>';
            // avatar and cover
            profileAvatar.setAttribute('src', avatarUrl);
            profileCoverDiv.style.backgroundImage = 'url("' + coverUrl + '")';
            
        });
        
        // get user postIds
        ajaxGet('/api/getProfilePostIds/' + userId, function(response) {
            postIds = response.data.postIds;
            
            postIds.forEach(function(postId, i) {
                getPost(postId);
            });
        });
    });
    
}


function addFriend(thisObj) {
    var postData = 'userId=' + userId;
    
    ajaxPost('/api/addFriend', postData, function(response) {
        if (response.errCode === 0) {
            thisObj.innerHTML = 'Cancel request';
            thisObj.setAttribute('onclick', 'cancelRequest(this);');
        }
    }); 
}

function unfriend(thisObj) {
    var postData = 'userId=' + userId;
    
    ajaxPost('/api/unfriend', postData, function(response) {
        if (response.errCode === 0) {
            thisObj.innerHTML = 'Add friend';
            thisObj.setAttribute('onclick', 'addFriend(this);');   
        }
    }); 
}

function cancelRequest(thisObj) {
    var postData = 'userId=' + userId;
    
    ajaxPost('/api/cancelRequest', postData, function(response) {
        if (response.errCode === 0) {
            thisObj.innerHTML = 'Add friend';
            thisObj.setAttribute('onclick', 'addFriend(this);');
        }
    }); 
}

// user who receives request
// on friend request notification

function deleteRequest(thisObj) {
    var postData = 'userId=' + userId;
    
    ajaxPost('/api/deleteRequest', postData, function(response) {
        var friendzoneDiv = document.querySelector('.profile-friendzone');
        var friendzoneBtn = document.querySelector('#friendzone-btn');
        
        if (response.errCode === 0) {
            friendzoneDiv.removeChild(thisObj);
            friendzoneDiv.removeChild(document.getElementById('acceptRequestBtn'));
            friendzoneBtn.innerHTML = 'Add friend';
            friendzoneBtn.setAttribute('onclick', 'addFriend(this);');
            friendzoneBtn.style.display = '';
        } 
    });
}

function acceptRequest(thisObj) {
    var postData = 'userId=' + userId;
    
    ajaxPost('/api/acceptRequest', postData, function(response) {
        var friendzoneDiv = document.querySelector('.profile-friendzone');
        var friendzoneBtn = document.querySelector('#friendzone-btn');
        
        if (response.errCode === 0) {
            friendzoneDiv.removeChild(thisObj);
            friendzoneDiv.removeChild(document.getElementById('deleteRequestBtn'));
            friendzoneBtn.innerHTML = 'Unfriend';
            friendzoneBtn.setAttribute('onclick', 'unfriend(this);');
            friendzoneBtn.style.display = '';
        }
    });
}