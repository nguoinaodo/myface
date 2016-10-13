var userId = window.location.pathname.substr(6);
var avatarUrl = '',
    coverUrl = '';
var myPostIds = [];
    
ready(main);

function main() {
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
        var profileAvatar = document.querySelector('.profile-avatar img');
        var profileCoverDiv = document.querySelector('.profile-cover');
        avatarUrl = data.avatar? data.avatar.url: '';
        coverUrl = data.cover? data.cover.url: '';
        
        document.querySelector('.profile-name span').innerHTML = data.info.displayName;
        
        aboutDiv.innerHTML = '<h3>Intro</h3><br>' + '<p>From ' + data.info.from +'</p>'
            + '<p>Lives in ' + data.info.livesIn + '</p>'
            + '<p>Birthday: ' + new Date(data.info.birthday).toDateString() + '</p>';
        
        profileAvatar.setAttribute('src', avatarUrl);
        profileCoverDiv.style.backgroundImage = 'url("' + coverUrl + '")';
    });
    
    ajaxRequest('GET', '/api/getUserPostIds/' + userId, function(data) {
        myPostIds = data.postIds;
        
        myPostIds.forEach(function(postId, i) {
            getPost(postId);
        });
    });
    
}