-- create tables
create table questions if not exists (
    questionid integer not null,
    questiontext varchar(500),
    answer varchar(50),
    hint varchar(500),
    trailid integer not null,
    primary key(trailid, questionid)
);

create table games if not exists(
    teamid integer not null,
    currentquestion integer,
    penaltypoints integer,
    answerpoints integer,
    duration integer,
    trailid integer not null,
    gameid serial not null,
    status varchar(20) not null default 'NOT_STARTED',
    primary key(gameid, teamid, trailid)
);

create table players if not exists(
    playerid serial primary key,
    playerfirstname varchar(30),
    playersurname varchar(30),
    phonenumber varchar(22),
    teamid integer
);

create table answers if not exists(
    teamid integer not null,
    questionnumber not null,
    providedanswer varchar(30),
    gameid integer not null,
    primary key(gameid,teamid,questionnumber)
);

create table rules if not exists(
    ruleid varchar(20) not null primary key,
    ruledesc varchar(200) not null,
    ruleorder integer
);

create table teams if not exists(
    teamid serial primary key, 
    teamname varchar(30)
);

-- add foreign key rules to tables
alter table players add constraint fk_teamid foreign key(teamid) references teams(teamid);

alter table answers add constraint fk_teamid foreign key(teamid) references teams(teamid);

alter table games 
add constraint fk_teamid foreign key(teamid) references teams(teamid)
add constraint fk_question foreign key(trailid, currentquestion) references questions(trailid, questionid);



