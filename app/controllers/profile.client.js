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
        
        console.log('hi');
        document.querySelector('.profile-name span').innerHTML = data.displayName;
        
        console.log(data.birthday);
        aboutDiv.innerHTML = '<h3>Intro</h3><br>' + '<p>From ' + data.from +'</p>'
            + '<p>Lives in ' + data.livesIn + '</p>'
            + '<p>Birthday: ' + new Date(data.birthday).toDateString() + '</p>';
    });
    
    ajaxRequest('GET', '/api/getUserCoverAndAvatar/' + userId, function(data) {
        var navbarAvatar = document.querySelector('.navbar-avatar img'),
            profileAvatar = document.querySelector('.profile-avatar img'),
            statusMyAvatar = document.querySelector('.status-my-avatar img');
        
        var profileCoverDiv = document.querySelector('.profile-cover');
        
        avatarURL = data.avatar.url;
        coverURL = data.cover.url;
        
        profileAvatar.setAttribute('src', avatarURL);
        
        profileCoverDiv.style.backgroundImage = 'url("' + coverURL + '")'    
    });
    
    // ajaxRequest('GET', '/api/getRelationshipStatus')
    ajaxRequest('GET', '/api/getUserPostIds/' + userId, function(data) {
        myPostIds = data.postIds;
        
        myPostIds.forEach(function(postId, i) {
            getPost(postId);
        });
    });
    
}