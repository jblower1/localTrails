--INCOMPLETE - CURRENTLY UPLOADING USING CSV FILES NOT THIS

-- establish team
create function createTeam(varchar) returns text as $$
DECLARE
    teamname alias for $1;
BEGIN
    insert into teams(teamname) values(teamname) returning teamid;
END;
$$ LANGUAGE plpgsql;

SELECT createTeam('New Team');
--create function createPlayer(teamname integer, firstname varchar, surname varchar, number varchar) as $$



