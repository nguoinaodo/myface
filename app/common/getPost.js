function getPost(postId) {
        var newsfeedDiv = document.getElementById('newsfeed');
        
        newsfeedDiv.innerHTML += '<div class="post" id="post' + postId + '"></div>';
            
            var postDiv = document.getElementById('post' + postId);
            
            var postHeader = '<div class="post-header" id="postHeader' + postId + '">' 
                + '<div class="post-owner-avatar left" id="post-owner-avatar' + postId + '"><img alt="img"></div>' 
                + '<div class="post-owner-name" id="post-owner-name' + postId + '"><b></b></div>'
                + '<div class="post-time" id="post-time' + postId + '"><span></span></div>'
                + '</div>';
            var postContent = '<div class="post-content" id="post-content' + postId + '">' 
                + '<div class="post-text" id="post-text' + postId + '"><p></p></div>'
                + '</div>';
            
            var postLikes = '<div class="post-likes" id="post-likes' + postId + '">' 
                + '<button onclick="like(this);" class="like-btn" id="like-btn' + postId + '"></button>'
                + ' <button onclick="getComments(this);" class="comment-btn" id="comment-btn' + postId + '">Comment</button>'
                + '</div>';
            
            var postComments = '<div class="comments" id="commentsPost' + postId + '"></div>';
            
            var commentPost = '<div class="comment-post" id="comment-post' + postId + '">' 
                + '<div class="comment-my-avatar left" id="comment-my-avatar' + postId + '"><img alt="img"></div>'
                + '<input placeholder="Write a comment.." class="comment-input" id="comment-input' + postId + '"></input>'
                + ' <button class="post-comment-btn" id="post-comment-btn' + postId + '">Post</button>'
                + '</div>';
                
            postDiv.innerHTML += postHeader + postContent 
                + postLikes + postComments +  commentPost;    
            
            ajaxRequest('GET', '/api/getPost/' + postId, function(data) {
                var likes = data.likes;
                var displayName = data.content.displayName,
                    dateTime = data.content.dateTime,
                    text = data.content.text,
                    avatarUrl = data.avatarUrl;
                var myAvatarUrl = document.querySelector('.navbar-avatar img').getAttribute('src');
                
                document.querySelector('#post-owner-name' + postId + ' b').innerHTML = displayName;
                document.querySelector('#post-time' + postId + ' span').innerHTML = dateTime;
                document.querySelector('#post-text' + postId + ' p').innerHTML = text;
                document.querySelector('#like-btn' + postId).innerHTML = likes + ' Like';
                document.querySelector('#post-owner-avatar' + postId + ' img').setAttribute('src', avatarUrl);
                document.querySelector('#comment-my-avatar' + postId + ' img').setAttribute('src', myAvatarUrl);
            });
            
    }

function like(thisObj) {
    var postId = thisObj.getAttribute('id').substr(10);
    
    ajaxPost('/api/like/' + postId, '', function(data) {
         
    });
} 

function getComments(thisObj) {
    var postId = thisObj.getAttribute('id').substr(11);
    
    ajaxRequest('GET', '/api/getPostComments/' + postId, function(data) {
        var comments = data.comments;
        var commentsDiv = document.getElementById('commentsPost' + postId);
        var commentArr = [];
        
        comments.forEach(function(comment, i) {
            var userId = comment.userId,
                displayName = comment.displayName,
                dateTime = comment.dateTime,
                text = comment.text,
                commentId = comment.commentId,
                avatarUrl = comment.avatarUrl;
            
            var commentHeader = '<div class="comment-header" id="comment-header' + commentId + '">' 
                + ' <div class="comment-owner-avatar left" id="comment-owner-avatar' + commentId + '">' 
                + ' <img alt="img" src="' + avatarUrl + '"></div>'
                + ' <div class="comment-owner-name" id="comment-owner-name' + commentId + '"><b>' + displayName + '</b></div>'
                + ' <div class="comment-time" id="comment-time' + commentId + '">' + dateTime + '</div>'
                + '</div>';
            
            var commentText = '<div class="comment-text" id="comment-text' + commentId + '"><p>' + text + '</p></div>';
            
            commentArr[i] = '<div class="comment" id="comment' + commentId + '">' 
                + commentHeader + commentText
                + '</div>';
        });
        
        commentArr.forEach(function(comment, i) {
            commentsDiv.innerHTML += comment; 
        });
    });
}