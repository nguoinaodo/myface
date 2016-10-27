var userId = null;
var avatarUrl = '';
var postIds = [];

ready(main);

function main() {
    ajaxRequest('GET', '/api/getNewsfeed', function(response) {
        console.log('newsfeed'); 
    });
}