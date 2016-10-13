var userId = window.location.pathname.substr(6);
var avatarURL = '',
    coverURL = '';
var myPostIds = [];
    
ready(main);

function main() {
    console.log(userId);
    var newsfeedDiv = document.getElementById('newsfeed');
    
    newsfeedDiv.innerHTML = '';
    
    
    // load info
    // + load photo
    // + load relationship code
    // load post
    // + load post info
    // + load photoKhi Torres băng lên như một cơn lốc, bỏ lại Vidic nằm dài trên thước cỏ - Một trong vô vàn những khoảnh khắc khó quên mà người hâm mộ vẫn luôn nhắc về những lần Liverpool đối đầu với Manchester United.

    // + load likes
    // + load comment
    ajaxRequest('GET', '/api/getUserInfo/' + userId, function(data) {
        var aboutDiv = document.getElementById('about');
        
        document.querySelector('.profile-name span').innerHTML = data.displayName;
        
        aboutDiv.innerHTML = '<h3>Intro</h3><br>' + '<p>From ' + data.from +'</p>'
            + '<p>Lives in ' + data.livesIn + '</p>'
            + '<p>Birthday: ' + new Date(data.birthday).toDateString() + '</p>';
    });
    
    ajaxRequest('GET', '/api/getUserCoverAndAvatar/' + userId, function(data) {
        var navbarAvatar = document.querySelector('.navbar-avatar img'),
            profileAvatar = document.querySelector('.profile-avatar img'),
            statusMyAvatar = document.querySelector('.status-my-avatar img');
        
        var profileCoverDiv = document.querySelector('.profile-cover');
        
        var avatarUrl = data.avatar? data.avatar.url: '';
        var coverUrl = data.cover? data.cover.url: '';
        
        console.log(avatarUrl);
        profileAvatar.setAttribute('src', avatarUrl);
        
        profileCoverDiv.style.backgroundImage = 'url("' + coverUrl + '")'    
    });
    
    // ajaxRequest('GET', '/api/getRelationshipStatus')
    ajaxRequest('GET', '/api/getUserPostIds/' + userId, function(data) {
        myPostIds = data.postIds;
        
        myPostIds.forEach(function(postId, i) {
            getPost(postId);
        });
    });
    
}