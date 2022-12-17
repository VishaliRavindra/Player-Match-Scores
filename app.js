const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let db = null;
initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(
        "server is successfully connected to https://localhost:3000/"
      );
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const responsePlayers = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const responseMatch = (matchObject) => {
  return {
    matchId: matchObject.match_id,
    match: matchObject.match,
    year: matchObject.year,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        *
    FROM
        player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((forEach) => responsePlayers(forEach)));
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
        *
    FROM
        player_details
    WHERE
        player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(responsePlayers(player));
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE
    player_details
    SET
       player_name = '${playerName}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
  SELECT
    *
  FROM
    match_details
  WHERE
    match_id = ${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(responseMatch(match));
});
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
  SELECT 
    *
  FROM
    player_match_score    
  NATURAL JOIN
   match_details
  WHERE
    player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatchQuery);
  response.send(playerMatches.map((eachMatch) => responseMatch(eachMatch)));
});
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayerQuery = `
    SELECT 
        *
    FROM
      player_match_score
    NATURAL JOIN
        player_details
    WHERE
      match_id = ${matchId};`;
  const matchPlayers = await db.all(getMatchPlayerQuery);
  response.send(matchPlayers.map((each) => responsePlayers(each)));
});
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuery = `
    SELECT 
        *
    FROM
      player_match_score
    NATURAL JOIN
        player_details
    WHERE
      match_id = ${matchId};`;
  const matchPlayers = await db.all(getPlayerScoreQuery);
  response.send(matchPlayers.map((each) => responsePlayers(each)));
});
module.exports = app;
