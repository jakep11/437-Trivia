drop database if exists trivia;
create database trivia;
use trivia;

create table Person (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   password varchar(50),
   points int DEFAULT 0,
   whenRegistered datetime not null,
   termsAccepted datetime,
   role int unsigned not null,  # 0 normal, 1 admin
   unique key(email)
);

create table Category (
   id int auto_increment primary key,
   title varchar(80) not null
);

create table Question (
   id int auto_increment primary key,
   ownerId int,
   categoryId int,
   title varchar(500) not null,
   answer varchar(100) not null,
   foreign key (ownerId) references Person(id) on delete cascade,
   foreign key (categoryId) references Category(id) on delete cascade,
   unique key UK_title(title)
);


-- Table is initially empty. When question is answer, the table populates
create table PersonQuestion (
  id int auto_increment primary key,
  personId int,
  questionId int,
  foreign key (personId) references Person(id) on delete cascade,
  foreign key (questionId) references Category(id) on delete cascade
);

insert into Person (firstName, lastName, email, password, points, whenRegistered, role)
  VALUES ("Joe", "Admin", "adm@11.com", "password", 0, NOW(), 1);
