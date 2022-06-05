//! INITIALISATIONS

import {
  matchOutcome,
  timeElapsed,
  stopLoadingAnimation,
  countryCheck,
  insertPlayersIntoLeaderboard,
  sortGamesByTime,
  ladderTypeGrammar,
  html1v1Game,
  htmlTeamGamePlayerTeam1,
  htmlTeamGamePlayerTeam2,
  gameInfo
} from "./functions.js"

let community = []
fetch('./community.json')
  .then(function(resp){
    return resp.json()
  })
  .then(function(data) {
    console.log(data)
    data['players'].forEach(player => {community.push(player)});
  })
let timeStarted = Math.floor((Date.now()/1000))
let civs = {}
let mapTypes = {}
let mapSizes = {}
let gameTypes = {}
let leaderboardTypes = {}
let timeNow = Math.floor(Date.now()/1000)
let thirtyMinsAgo = timeNow - 1800
// let thirtyMinsAgo = 1649190999
let liveGbMatches = []
let pastGbMatches = []
// liveGbPlayers is an object because I want both the player and the match they're currently in. Player is key, match is value
let liveGbPlayers = {}
// Setting the community steam IDs. Move this to a .env file before going live

initialiseStrings().catch( error => {console.log("aoe2.net api is down", error)})

async function initialiseStrings () {
  const response = await (await fetch('https://aoe2.net/api/strings?game=aoe2de&language=en')).json()
  response['civ'].forEach((civ) => {civs[civ['id']] = civ['string']});
  response['map_type'].forEach((mapType) => {mapTypes[mapType['id']] = mapType['string']});
  response['map_size'].forEach((mapSize) => {mapSizes[mapSize['id']] = mapSize['string']});
  response['game_type'].forEach((gameType) => {gameTypes[gameType['id']] = gameType['string']});
  response['leaderboard'].forEach((leaderboardType) => {leaderboardTypes[leaderboardType['id']] = leaderboardType['string']})
}

getLeaderboard().catch( error => {console.log(error)})

console.log('civs', civs)
console.log('map types', mapTypes)
console.log('mapSizes', mapSizes)
console.log('gameTypes', gameTypes)
console.log('leaderboardTypes', leaderboardTypes)

//! API REQUESTS

async function getLeaderboard () {
  const responseTop10k = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=10000')).json()
  let globalLeaderboard = responseTop10k['leaderboard']
  const response10kTo20k = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=10001&count=10000')).json()
  response10kTo20k['leaderboard'].forEach(player => {
    globalLeaderboard.push(player)
  });
  filterCommunityLeaderboard(globalLeaderboard)
  console.log('Global Leaderboard', globalLeaderboard)
}

getCurrentMatches().catch( error => {console.log(error)})

async function getCurrentMatches () {
  fetch(`https://aoe2.net/api/matches?game=aoe2de&count=1000&since=${thirtyMinsAgo}`)
  .then(response => response.json())
  .then(currentMatches => {
    console.log('current matches', currentMatches)
    filterCommunityMatches(currentMatches)
  });
}



//! FILTERING 

// this function wil take the community and a global leaderboard and filter to only show community players
const filterCommunityLeaderboard = (globalLeaderboard) => {
  const gbLeaderboard = globalLeaderboard.filter((player) => {
    return community.some((communityPlayer) => {
      return communityPlayer.steam_id === player.steam_id
    });
  });
  insertPlayersIntoLeaderboard(gbLeaderboard)
  console.log('gbLeaderboard', gbLeaderboard)
}

// this function wil take the community and a global list of current matches and filter to only show matches with community players
const filterCommunityMatches = (globalMatches) => {
  globalMatches.forEach((match) => {
    return community.some((communityPlayer) => {
      match['players'].forEach((player) => {
        if (communityPlayer.steam_id === player.steam_id && match['finished'] === null) {
          liveGbMatches.push(match)
        } else if (communityPlayer.steam_id === player.steam_id && match['finished'] != null) {
          pastGbMatches.push(match)
        }
        return communityPlayer.steam_id === player.steam_id
      });
    });
  });
  // the line below removes duplicate matches (where 2 or more community members are playing in the same match)
  const dedupedLiveGbMatches = [...new Set(liveGbMatches)]
  const dedupedPastGbMatches = [...new Set(pastGbMatches)]
  console.log('Live GB Matches: ', dedupedLiveGbMatches)
  console.log('Past GB Matches: ', dedupedPastGbMatches)
  insertLiveGames(dedupedLiveGbMatches)
  insertRecentlyCompletedGames(dedupedPastGbMatches)
}
// This function will take 1 match and split the players into their teams and sort them by colour
const sortAndSplitPlayersIntoTeams = (gbMatch) => {
  
  let allPlayers = gbMatch['players']
  let sortedPlayers = allPlayers.sort((a, b) => b['team']-a['team'])
  let team1 = []
  let team2 = []
  if (allPlayers.length === 2) {
    team1 = [allPlayers[0]]
    team2 = [allPlayers[1]]
  } else if (allPlayers.length === 4) {
    team1 = [allPlayers[0],allPlayers[1]]
    team2 = [allPlayers[2],allPlayers[3]]

  } else if (allPlayers.length === 6) {
    team1 = [allPlayers[0],allPlayers[1], allPlayers[2]]
    team2 = [allPlayers[3],allPlayers[4], allPlayers[5]]
    
  } else if (allPlayers.length === 8 ) {
    team1 = [allPlayers[0],allPlayers[1], allPlayers[2],allPlayers[3]]
    team2 = [allPlayers[4],allPlayers[5], allPlayers[6],allPlayers[7]]
  }
  team1.sort((a, b) => b['color']-a['color'])
  team2.sort((a, b) => a['color']-b['color'])
  return [team1, team2]
}

//! INSERT HTML

const insertRecentlyCompletedGames = (pastGbMatches) => {
  sortGamesByTime(pastGbMatches)
  stopLoadingAnimation('recently-completed-games-loader')
  if (pastGbMatches.length === 0) {
    document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
    `<p class="center-align light-weight">No games have finished recently</p>`)
  } else {
    pastGbMatches.forEach((match) => {
      const teams = sortAndSplitPlayersIntoTeams(match)
      const team1 = teams[0]
      const team2 = teams[1]
      const team1Player1 = teams[0][0]
      const team1Player2 = teams[0][1]
      const team1Player3 = teams[0][2]
      const team1Player4 = teams[0][3]
      const team2Player1 = teams[1][0]
      const team2Player2 = teams[1][1]
      const team2Player3 = teams[1][2]
      const team2Player4 = teams[1][3]

      let team1EloAvg = 0
      let team2EloAvg = 0 
      team1.forEach((player) => {
        team1EloAvg += player['rating']
      })
      team1EloAvg = Math.floor(team1EloAvg/team1.length)
      team2.forEach((player) => {
        team2EloAvg += player['rating']
      })
      team2EloAvg = Math.floor(team2EloAvg/team2.length)
      
      console.log(pastGbMatches)
      
      if (match['players'].length % 2 != 0){
        exit
      } else if (match['players'].length === 2) {
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `${html1v1Game(civs, mapTypes, '1v1', match, team1Player1, team2Player1)}
        ${gameInfo(mapTypes, match, team1EloAvg, team2EloAvg)}
        </div>
        `)
      } else {
      // NEW FUNCTION
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="game">
          <div class="team-game-header">
            <h4 class="${matchOutcome(team1Player1)}">Team 1</h4>
            <h4>Vs</h4>
            <h4 class="${matchOutcome(team2Player1)}">Team 2</h4>
          </div>
          <div class="team-game-teams">
            <div class="team-game-team-column">
              ${htmlTeamGamePlayerTeam1(civs, team1Player1)}
              ${htmlTeamGamePlayerTeam1(civs, team1Player2)}
              ${team1Player3 === undefined ? '' : htmlTeamGamePlayerTeam1(civs, team1Player3)}
              ${team1Player4 === undefined ? '' : htmlTeamGamePlayerTeam1(civs, team1Player4)}
            </div>
            <div class="team-game-team-column">
              ${htmlTeamGamePlayerTeam2(civs, team2Player1)}
              ${htmlTeamGamePlayerTeam2(civs, team2Player2)}
              ${team2Player3 === undefined ? '' : htmlTeamGamePlayerTeam2(civs, team2Player3)}
              ${team2Player4 === undefined ? '' : htmlTeamGamePlayerTeam2(civs, team2Player4)}
            </div>
          </div>
          ${gameInfo(mapTypes, match, team1EloAvg, team2EloAvg)}
        </div>`)   
      }
    });
  }
}

const insertLiveGames = (liveGbMatches) => {
  liveGbMatches = sortGamesByTime(liveGbMatches)

  stopLoadingAnimation('current-games-loader')
  insertPlayersIntoStatusTables(liveGbMatches)
  if (liveGbMatches.length === 0) {
    document.querySelector('.current-games').insertAdjacentHTML("beforeend",
    `<p class="center-align light-weight">No games have started recently</p>`)
  } else {
    liveGbMatches.forEach((match) => {
      const teams = sortAndSplitPlayersIntoTeams(match)
      const team1 = teams[0]
      const team2 = teams[1]
      const team1Player1 = teams[0][0]
      const team1Player2 = teams[0][1]
      const team1Player3 = teams[0][2]
      const team1Player4 = teams[0][3]
      const team2Player1 = teams[1][0]
      const team2Player2 = teams[1][1]
      const team2Player3 = teams[1][2]
      const team2Player4 = teams[1][3]
      let team1EloAvg = 0
      let team2EloAvg = 0 

      team1.forEach((player) => {team1EloAvg += player['rating']})
      team1EloAvg = Math.floor(team1EloAvg/team1.length)
      team2.forEach((player) => {team2EloAvg += player['rating']})
      team2EloAvg = Math.floor(team2EloAvg/team2.length)

      // NEW FUNCTIONS


      if (match['players'].length % 2 != 0){
        exit
      } else if (match['players'].length === 2) {
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",        
        `${html1v1Game(civs, mapTypes, '1v1', match, team1Player1, team2Player1)}
        ${gameInfo(mapTypes, match, team1EloAvg, team2EloAvg)}
        </div>
        `)
      } else {
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",
        `<div class="game">
          <div class="team-game-header">
            <h4 class="${matchOutcome(team1Player1)}">Team 1</h4>
            <h4>Vs</h4>
            <h4 class="${matchOutcome(team2Player1)}">Team 2</h4>
          </div>
          <div class="team-game-teams">
            <div class="team-game-team-column">
              ${htmlTeamGamePlayerTeam1(civs, team1Player1)}
              ${htmlTeamGamePlayerTeam1(civs, team1Player2)}
              ${team1Player3 === undefined ? '' : htmlTeamGamePlayerTeam1(civs, team1Player3)}
              ${team1Player4 === undefined ? '' : htmlTeamGamePlayerTeam1(civs, team1Player4)}
            </div>
            <div class="team-game-team-column">
              ${htmlTeamGamePlayerTeam2(civs, team2Player1)}
              ${htmlTeamGamePlayerTeam2(civs, team2Player2)}
              ${team2Player3 === undefined ? '' : htmlTeamGamePlayerTeam2(civs, team2Player3)}
              ${team2Player4 === undefined ? '' : htmlTeamGamePlayerTeam2(civs, team2Player4)}
            </div>
          </div>
          ${gameInfo(mapTypes, match, team1EloAvg, team2EloAvg)}
        </div>`
        )
      }
    });
  }
}

// this function will check who's playing a live game and insert the match into the current games section
const insertPlayersIntoStatusTables = (liveGbMatches) => {
  liveGbMatches.forEach ((match) => {
    match['players'].forEach((player) =>{
      return community.some((communityPlayer) => {
        if (communityPlayer.steam_id === player.steam_id){
          liveGbPlayers[player['name']] = match
        }
      });
    })
  })
  stopLoadingAnimation('players-loader')
  if (Object.keys(liveGbPlayers).length === 0) {
    document.querySelector('.players').insertAdjacentHTML("beforeend",
    `<p class="center-align no-players light-weight">No players have started a game recently</p>`)
  } else {
  const keys = Object.keys(liveGbPlayers)
    keys.forEach((playerName) => {
      document.getElementById('status-table').insertAdjacentHTML("beforeend",
      `<p class="left-align light-weight status-player"><strong>${playerName}</strong> started ${ladderTypeGrammar(leaderboardTypes[liveGbPlayers[playerName]['leaderboard_id']])} ${timeElapsed(liveGbPlayers[playerName]['started'])}m ago</p>`
      )
    })
  }
}
