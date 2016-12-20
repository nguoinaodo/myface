// info
var myUserId;
var myToken;
// newsfeed
var userId = null;
var postIds = [];

ready(main);

function main() {
    getNotiCount();
    getFriendReqNotiCount();
    getMessageCount()
    // get my info
    ajaxGet('/api/myInfo', function(response) {
        var data = response.data;
        
        myUserId = data.userId;
        myToken = data.token;
        // connect socket
        ioConnect();
    });
    // get newsfeed
    ajaxGet('/api/getNewsfeed', function(response) {
        
    });
}