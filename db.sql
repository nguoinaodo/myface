create table `user` (
	`userId` int not null auto_increment,
    `email` varchar(100) not null,
    `displayName` varchar(256),
    `password` varchar(128),
    `from` varchar(256),
    `livesIn` varchar(256),
    `birthday` date,
    `sex` enum('male', 'female', 'other'),
    primary key (`userId`),
    unique index `email_unique` (`email` asc)
);

create table `post` (
	`postId` int not null auto_increment,
    `text` text,
    primary key (`postId`)
);

create table `comment` (
	`commentId` int not null auto_increment,
    `text` text,
    primary key (`commentId`)
);

create table `photo` (
	`photoId` int not null auto_increment,
    `url` text,
    `postId` int,
    primary key (`photoId`)
);

create table `relationship` (
	`userId1` int not null,
    `userId2` int not null,
    `statusCode` tinyint,
    `actionId` int not null,
    primary key (`userId1`, `userId2`)
);

create table `notification` (
	`notiId` bigint not null auto_increment,
    `dateTime` datetime,
    `actionCode` tinyint,
    `lastFrom` int,
    `to` int not null,
    `read` tinyint default 0,
    `postId` int,
    primary key (`notiId`),
    unique index `notification_unique` (`actionCode` asc, `to` asc, `postId` asc)
);

create table `friend_request` (
	`friendReqId` bigint not null auto_increment,
    `dateTime` datetime,
    `actionCode` tinyint,
    `from` int,
    `to` int not null,
    `read` tinyint default 0,
    primary key (`friendReqId`)
);

create table `dang_bai` (
	`postId` int not null,
    `userId` int not null,
    `dateTime` datetime,
    primary key (`postId`)
);

create table `yeu_thich` (
	`userId` int not null,
    `postId` int not null,
    `dateTime` datetime,
    primary key (`userId`, `postId`)
);

create table `binh_luan` (
	`commentId` int not null auto_increment,
    `userId` int not null,
    `postId` int not null,
    `dateTime` datetime,
    primary key (`commentId`)
);

create table `avatar` (
	`photoId` int not null,
    `userId` int not null,
    `dateTime` datetime
);

create table `cover` (
	`photoId` int not null,
    `userId` int not null,
    `dateTime` datetime
);

create table `dang_len_tuong` (
	`userId1` int not null, 
    `userId2` int not null,
    `postId` int not null,
    `dateTime` datetime,
    primary key (`postId`)
);

create table `conversation` (
	`conId` int not null auto_increment,
	`userId1` int not null,
    `userId2` int not null,
    `lastFrom` int not null,
	`read` tinyint,
    `dateTime` datetime,
    primary key (`conId`)
);

create table `conversation_reply` (
	`replyId` int not null auto_increment,
    `content` varchar(4096),
    primary key (`replyId`)
);

create table `reply` (
	`replyId` int not null,
    `userId` int not null,
    `conId` int not null,
    `dateTime` datetime,
    primary key (`replyId`),
    index `dateTime_index` (`dateTime` desc)
);

alter table `photo`
	add constraint `fk_photo_postId` foreign key (`postId`)
    references `post`(`postId`)
    on delete cascade;

alter table `dang_bai` 
	add constraint `fk_dang_bai_userId` foreign key (`userId`)
    references `user`(`userId`)
    on delete cascade,
    add constraint `fk_dang_bai_postId` foreign key (`postId`)
    references `post`(`postId`)
    on delete cascade;
    
alter table `yeu_thich`
	add constraint `fk_yeu_thich_userId` foreign key (`userId`)
    references `user`(`userId`)
    on delete cascade,
    
    add constraint `fk_yeu_thich_postId` foreign key (`postId`)
    references `post`(`postId`) 
    on delete cascade;

alter table `binh_luan` 
	add constraint `fk_binh_luan_commentId` foreign key (`commentId`)
    references `comment`(`commentId`)
    on delete cascade,
    
    add constraint `fk_binh_luan_userId` foreign key (`userId`)
    references `user`(`userId`) 
    on delete cascade,
    
    add constraint `fk_binh_luan_postId` foreign key (`postId`)
    references `post`(`postId`)
    on delete cascade;

alter table `avatar`
	add constraint `fk_avatar_photoId` foreign key (`photoId`)
    references `photo`(`photoId`) 
    on delete cascade,
    
    add constraint `fk_avatar_userId` foreign key (`userId`)
    references `user`(`userId`) 
    on delete cascade;

alter table `cover`
	add constraint `fk_cover_photoId` foreign key (`photoId`)
    references `photo`(`photoId`) 
    on delete cascade,
    
    add constraint `fk_cover_userId` foreign key (`userId`)
    references `user`(`userId`) 
    on delete cascade;

alter table `dang_len_tuong` 
	add constraint `fk_dang_len_tuong_userId1` foreign key (`userId1`)
    references `user`(`userId`)
    on delete cascade,
    
    add constraint `fk_dang_len_tuong_userId2` foreign key (`userId2`)
    references `user`(`userId`)
    on delete cascade,
    
    add constraint `fk_dang_len_tuong_postId` foreign key (`postId`)
    references `post`(`postId`)
    on delete cascade;

alter table `conversation`
	add constraint `fk_conversation_userId1` foreign key (`userId1`)
    references `user`(`userId`)
    on delete cascade,
    
    add constraint `fk_conversation_userId2` foreign key (`userId2`)
    references `user`(`userId`)
    on delete cascade;

alter table `reply` 
	add constraint `fk_reply_userId` foreign key (`userId`)
    references `user`(`userId`)
    on delete cascade,
    
    add constraint `fk_reply_conId` foreign key (`conId`)
    references `conversation`(`conId`)
    on delete cascade,
    
    add constraint `fk_reply_replyId` foreign key (`replyId`)
    references `conversation_reply`(`replyId`)
    on delete cascade;

alter table `notification` 
	add constraint `fk_notification_last_from` foreign key (`lastFrom`)
    references `user`(`userId`)
    on delete cascade,
    
    add constraint `fk_notification_postId`	foreign key (`postId`)
    references `post`(`postId`) on delete cascade,
    
    add constraint `fk_notification_to` foreign key (`to`)
    references `user`(`userId`)
    on delete cascade;

alter table `friend_request` 
	add constraint `fk_friend_request_from` foreign key (`from`)
    references `user`(`userId`) on delete cascade,
    
    add constraint `fk_friend_requset_to` foreign key (`to`)
    references `user`(`userId`) on delete cascade;

alter table `relationship` 
	add constraint `fk_relationship_userId1` foreign key (`userId1`)
    references `user`(`userId`) 
    on delete cascade,
    
    add constraint `fk_relationship_userId2` foreign key (`userId2`)
    references `user`(`userId`) 
    on delete cascade,
    
	add constraint `fk_relationship_actionId` foreign key (`actionId`)
	references `user`(`userId`) on delete cascade;

insert into `photo` (`url`) values('/public/img/male.jpg');
insert into `photo` (`url`) values('/public/img/female.jpg');
insert into `photo` (`url`) values('/public/img/other.jpg');