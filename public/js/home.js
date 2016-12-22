// info
var myUserId;
var myToken;
// newsfeed
var userId = null;
var postIds = [];
const POSTS_PER_PAGE = 12;
var newsfeedPage = 0; 

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
    ajaxGet('/api/getNewsfeedPostIdsByDateTime?page=0', function(response) {
        var postIds = response.data.postIds;
        postIds.forEach((postId, i) => {
            getPost(postId);
        });
        var newsfeed = document.getElementById('newsfeed');
        var newsfeedSeeMore = document.createElement('div');
        newsfeedSeeMore.innerHTML = '<button class="newsfeed-see-more">See more</button>';
        newsfeedSeeMore.setAttribute('onclick', 'seeMoreNewsfeed(this)');
        newsfeed.appendChild(newsfeedSeeMore);
    });
}

function seeMoreNewsfeed(thisObj) {
    newsfeedPage++;
    var newsfeed = document.getElementById('newsfeed');
    if (document.querySelector('.newsfeed-see-more')) {
        document.querySelector('.newsfeed-see-more').remove();
    }
    
    ajaxGet('/api/getNewsfeedPostIdsByDateTime?page=' + newsfeedPage, function(response) {
        var postIds = response.data.postIds;
        postIds.forEach((postId, i) => {
            getPost(postId);
        });

        var newsfeedSeeMore = document.createElement('div');
        newsfeedSeeMore.innerHTML = '<button class="newsfeed-see-more">See more</button>';
        newsfeedSeeMore.setAttribute('onclick', 'seeMoreNewsfeed(this)');
        newsfeed.appendChild(newsfeedSeeMore);
    });
}