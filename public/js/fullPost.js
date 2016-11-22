// my info
var myUserId;
var myToken;
// post
var pathArr = window.location.pathname.split('/');
var postId = Number(pathArr[2]);

ready(main);

function main() {
    var newsfeedDiv = document.getElementById('newsfeed');
    
    getNotiCount();
    getFriendReqNotiCount();
    newsfeedDiv.innerHTML = '';
    // get my info
    ajaxGet('/api/myInfo', function(response) {
        var data = response.data;
        myUserId = data.userId;
        myToken = data.token;
        // connect socket
        ioConnect();
        // get post
        getPost(postId);
    });
    
}