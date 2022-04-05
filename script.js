let timeStarted = Math.floor((Date.now()/1000))

let civs = {}
let mapTypes = {}
let mapSizes = {}
let gameTypes = {}
let leaderboardTypes = {}
let timeNow = Math.floor(Date.now()/1000)
let thirtyMinsAgo = timeNow - 1800
let liveGbMatches = []
let pastGbMatches = []
// liveGbPlayers is an object because I want both the player and the match they're currently in. Player is key, match is value
let liveGbPlayers = {}
// Setting the community steam IDs. Move this to a .env file before going live
let community = [
  {name:'Rhea', steam_id:'76561198259669186'},
  {name:'Crouch', steam_id:'76561198924852470'},
  {name:'Alfred', steam_id:'76561198122298655'},
  {name:'Fanjita', steam_id:'76561198001997423'},
  {name:'IamMike_', steam_id:'76561198313552709'},
  {name:'DanMT', steam_id:'76561198076329437'},
  {name:'Aten', steam_id:'76561198113813670'},
  {name:'Tea', steam_id:'76561198109315523'},
  {name:'Toady', steam_id:'76561198029951106'},
  {name:'King Boo', steam_id:'76561198245164292'},
  {name:'Bot Marley', steam_id:'76561198056640339'},
  {name:'Hallis', steam_id:'76561198061054857'},
  {name:'Steak', steam_id:'76561198040347770'},
  {name:'Squeaker', steam_id:'76561198124562338'},
  {name:'seafood', steam_id: '76561198350566117'},
  {name:'Canary', steam_id: '76561199043818620'},
  {name:'yummy', steam_id: '76561198863514740'},
  {name:'Ozone', steam_id: '76561198826220092'},
  {name:'Jordan23', steam_id: '76561198400058723'},
  {name:'Vilese', steam_id: '76561198325239137'},
  {name:'Meteor', steam_id: '76561198399553801'}
]

document.getElementById('about-btn').addEventListener('click', function() { document.getElementById('about-txt').classList.toggle("display-none") }, false);
// Console log the error if initialiseStrings doesnt run
initialiseStrings().catch( error => {
  console.log(error)
  console.log("Write something in this function to say aoe2.net is done")
})

  // Assigning civs, map types and map sizes from API to local memory so that I can get strings with just ID without any more API queries
async function initialiseStrings () {
  // not sure why I need 2 awaits in the line below. it breaks with just 1 
  const response = await (await fetch('https://aoe2.net/api/strings?game=aoe2de&language=en')).json()
  response['civ'].forEach((civ) => {
    civs[civ['id']] = civ['string']
  });
  response['map_type'].forEach((mapType) => {
    mapTypes[mapType['id']] = mapType['string']
  });
  response['map_size'].forEach((mapSize) => {
    mapSizes[mapSize['id']] = mapSize['string']
  });
  response['game_type'].forEach((gameType) =>{
    gameTypes[gameType['id']] = gameType['string']
  });
  response['leaderboard'].forEach((leaderboardType) =>{
    leaderboardTypes[leaderboardType['id']] = leaderboardType['string']
  })
}

console.log('civs', civs)
console.log('map types', mapTypes)
console.log('mapSizes', mapSizes)
console.log('gameTypes', gameTypes)
console.log('leaderboardTypes', leaderboardTypes)
  
getLeaderboard().catch( error => {
  console.log(error)
})

async function getLeaderboard () {
  const response = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=3000')).json()
  let globalLeaderboard = response['leaderboard']
  filterCommunityLeaderboard(globalLeaderboard)
}

// this function wil take the community and a global leaderboard and filter to only show community players
function filterCommunityLeaderboard (globalLeaderboard) {
  const gbLeaderboard = globalLeaderboard.filter((player) => {
    return community.some((communityPlayer) => {
      return communityPlayer.steam_id === player.steam_id
    });
  });
  insertPlayersIntoLeaderboard(gbLeaderboard)
}

function insertPlayersIntoLeaderboard (gbLeaderboard) {
  stopLoadingAnimation('leaderboard-loader')
  gbLeaderboard.forEach((player) => {
    document.querySelector('.player-table-body').insertAdjacentHTML("beforeend", 
    `<tr>
      <th scope="row" class="left-align">${player['name']}</th>
      <td>${player['rating']}</td>
    </tr>`
    );
  });
}

getCurrentMatches()

async function getCurrentMatches () {
  console.log('getting current matches..', `https://aoe2.net/api/matches?game=aoe2de&count=1000&since=${thirtyMinsAgo}` )
  // fetch(`https://aoe2.net/api/matches?game=aoe2de&count=100&since=1647710738`)
  fetch(`https://aoe2.net/api/matches?game=aoe2de&count=1000&since=${thirtyMinsAgo}`)
  .then(response => response.json())
  .then(currentMatches => {
    console.log('current matches', currentMatches)
    filterCommunityMatches(currentMatches)
  });
}

// this function wil take the community and a global list of current matches and filter to only show matches with community players
function filterCommunityMatches(globalMatches) {
  globalMatches.forEach((match) => {
    return community.some((communityPlayer) => {
      match['players'].forEach((player) => {
        if (communityPlayer.steam_id === player.steam_id && match['finished'] === null) {
          console.log('Found a match being played by a community member')
          liveGbMatches.push(match)
        } else if (communityPlayer.steam_id === player.steam_id && match['finished'] != null) {
          console.log('Found a match recently played by a community member')
          pastGbMatches.push(match)
        }
        return communityPlayer.steam_id === player.steam_id
      });
    });
  });
  // the line below removes duplicate matches (where 2 or more community members are playing in the same match)
  dedupedLiveGbMatches = [...new Set(liveGbMatches)]
  dedupedPastGbMatches = [...new Set(pastGbMatches)]
  console.log('Live GB Matches: ', dedupedLiveGbMatches)
  console.log('Past GB Matches: ', dedupedPastGbMatches)
  insertLiveGames(dedupedLiveGbMatches)
  insertRecentlyCompletedGames(dedupedPastGbMatches)
}
// This function will take 1 match and split the players into their teams and sort them by colour
function sortAndSplitPlayersIntoTeams(gbMatch) {
  
  let allPlayers = gbMatch['players']
  console.log('all players', allPlayers)
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

function insertRecentlyCompletedGames (pastGbMatches){
  console.log('inserting recently completed games...')
  stopLoadingAnimation('recently-completed-games-loader')
  console.log(pastGbMatches)
  if (pastGbMatches.length === 0) {
    document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
    `<p class="center-align">No games have been completed recently</p>`)
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

      const team1EloAvg = 0
      const team2EloAvg = 0 
      team1.forEach((player) => {
        team1EloAvg += player['rating']
      })
      team1EloAvg = Math.floor(team1EloAvg/team1.length)
      console.log('team 1 elo avg =',team1EloAvg)
      
      team2.forEach((player) => {
        team2EloAvg += player['rating']
      })
      team2EloAvg = Math.floor(team2EloAvg/team2.length)
      console.log('team 2 elo avg =',team2EloAvg)
      
      console.log('completed teams',teams)
      console.log('completed match', match)
      console.log(pastGbMatches)
      if (match['players'].length % 2 != 0){
        exit
      } else if (match['players'].length === 2) {
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="game-header">
            <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]} civilisation">
            <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
            <h4>${team1Player1['name']}</h4>
            <h4>Vs</h4>
            <h4>${team2Player1['name']}</h4>
            <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
            <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]} civilisation">
          </div>
          <div class="elo">
            <p>${team1Player1['rating']}</p>
            <p>Elo</p>
            <p>${team2Player1['rating']}</p>
          </div>
          <div class="country">
            <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="${team1Player1['country']} Flag">
            <p>Country</p>
            <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="${team2Player1['country']} Flag">
          </div>
          <div class="game-properties">
          <p>${timeElapsed(match['started'])}m ago</p>
          <p><i class="fa-solid fa-earth-americas"></i> ${mapTypes[match['map_type']]}
          <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
          <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a></p>
          </div>
        </div>`)
      } else if (match['players'].length === 4) {
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4>Team 1</h4>
            <h4>Vs</h4>
            <h4>Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p>${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player2['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p>${team1Player2['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player2['country'].toLowerCase()}.png" alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo (avg)</p>
            <p>${team2EloAvg}</p>
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
            <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
          </div>
        </div>
      </div>`)
      } else if (match['players'].length === 6){
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4>Team 1</h4>
            <h4>Vs</h4>
            <h4>Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p>${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player2['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p>${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player3['country'].toLowerCase()}.png" alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p>${team1Player3['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player2['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player3['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player3['country'].toLowerCase()}.png" alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
        <div class="elo">
          <p>${team1EloAvg}</p>
          <p>Elo (avg)</p>
          <p>${team2EloAvg}</p>
        </div>
        <div class="game-properties">
          <p>${timeElapsed(match['started'])}m ago</p>
          <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
          <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
          <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
        </div>
      </div>
      `)
      }  else if (match['players'].length === 8){
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4>Team 1</h4>
            <h4>Vs</h4>
            <h4>Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align">${team1Player1['name']}TEST2</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player2['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player3['country'].toLowerCase()}.png" alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align">${team1Player3['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player4['country'].toLowerCase()}.png" alt="${civs[team1Player4['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player4['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player4['color']}">${team1Player4['color']}</p>
              <p class="right-align">${team1Player4['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player2['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player3['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player4['name']}</p>
              <p class="player p${team2Player4['color']}">${team2Player4['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player4['civ']].toLowerCase()}.png" alt="${civs[team2Player4['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player4['country'].toLowerCase()}.png" alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
        <div class="elo">
          <p>${team1EloAvg}</p>
          <p>Elo (avg)</p>
          <p>${team2EloAvg}</p>
        </div>
        <div class="game-properties">
          <p>${timeElapsed(match['started'])}m ago</p>
          <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
          <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
          <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
        </div>
      </div>
      </div>
      `)
      } else {
        // code for odd number of players in a match
      }
    });
  }
}

function sortGamesByTime (matches) {
  console.log('matches to be sorted', matches)
  sortedMatches = matches.sort((a, b) => b['opened']-a['opened'])
  console.log('sorted matches', sortedMatches)
  return sortedMatches
}

function insertLiveGames (liveGbMatches) {
  console.log('inserting live games...')

  liveGbMatches = sortGamesByTime(liveGbMatches)

  stopLoadingAnimation('current-games-loader')
  insertPlayersIntoStatusTables(liveGbMatches)
  if (liveGbMatches.length === 0) {
    document.querySelector('.current-games').insertAdjacentHTML("beforeend",
    `<p class="center-align">No games have been started recently</p>`)
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
      console.log('teams',teams)
      console.log('match', match)
      const team1EloAvg = 0
      const team2EloAvg = 0 

      team1.forEach((player) => {
        team1EloAvg += player['rating']
      })
      team1EloAvg = Math.floor(team1EloAvg/team1.length)
      console.log('team 1 elo avg =',team1EloAvg)
      
      team2.forEach((player) => {
        team2EloAvg += player['rating']
      })
      team2EloAvg = Math.floor(team2EloAvg/team2.length)
      console.log('team 2 elo avg =',team2EloAvg)

      console.log('live teams',teams)
      console.log('live match', match)

      if (match['players'].length % 2 != 0){
        exit
      } else if (match['players'].length === 2) {
        console.log('bug',team2Player1)
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="game-header">
            <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]} civilisation">
            <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
            <h4>${team1Player1['name']}</h4>
            <h4>Vs</h4>
            <h4>${team2Player1['name']}</h4>
            <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
            <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]} civilisation">
          </div>
          <div class="elo">
            <p>${team1Player1['rating']}</p>
            <p>Elo</p>
            <p>${team2Player1['rating']}</p>
          </div>
          <div class="country">
            <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="${team1Player1['country']} Flag">
            <p>Country</p>
            <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="${team2Player1['country']} Flag">
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i> ${mapTypes[match['map_type']]}
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
            <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a></p>
          </div>
        </div>
        `)
      } else if (match['players'].length === 4) {
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4>Team 1</h4>
            <h4>Vs</h4>
            <h4>Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player2['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align">${team1Player2['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player2['country'].toLowerCase()}.png" alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo (avg)</p>
            <p>${team2EloAvg}</p>
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
            <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
          </div>
        </div>
      </div>`)
      } else if (match['players'].length === 6){
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4>Team 1</h4>
            <h4>Vs</h4>
            <h4>Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player2['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player3['country'].toLowerCase()}.png" alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align">${team1Player3['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player2['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player3['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player3['country'].toLowerCase()}.png" alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo (avg)</p>
            <p>${team2EloAvg}</p>
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
            <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
          </div>
        </div>
      </div>
      `)
      }  else if (match['players'].length === 8){
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4>Team 1</h4>
            <h4>Vs</h4>
            <h4>Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player1['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player2['country'].toLowerCase()}.png" alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player3['country'].toLowerCase()}.png" alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align">${team1Player3['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team1Player4['country'].toLowerCase()}.png" alt="${civs[team1Player4['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player4['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player4['color']}">${team1Player4['color']}</p>
              <p class="right-align">${team1Player4['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player1['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player2['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player3['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player3['country'].toLowerCase()}.png" alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p>${team2Player4['name']}</p>
              <p class="player p${team2Player4['color']}">${team2Player4['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player4['civ']].toLowerCase()}.png" alt="${civs[team2Player4['civ']]}">
              <img id="country-flag" src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${team2Player4['country'].toLowerCase()}.png" alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo (avg)</p>
            <p>${team2EloAvg}</p>
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
            <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
          </div>
        </div>
      </div>
      `)
      } else {
        // code for odd number of players in a match. Only relevant for FFA
      }
    });
  }
}

// this function will check who's playing a live game and insert the match into the current games section
function insertPlayersIntoStatusTables(liveGbMatches) {
  console.log('live GB matches', liveGbMatches)
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
  console.log(liveGbPlayers, liveGbPlayers.length)
  if (Object.keys(liveGbPlayers).length === 0) {
    document.querySelector('.players').insertAdjacentHTML("beforeend",
    `<p class="center-align">No players have started a game recently</p>`)
  } else {
  keys = Object.keys(liveGbPlayers)
    keys.forEach((playerName) => {
      console.log(playerName,liveGbPlayers[playerName])
      document.getElementById('status-table').insertAdjacentHTML("beforeend",
      `<p class="left-align light-weight"><strong>${playerName}</strong> started a ${leaderboardTypes[liveGbPlayers[playerName]['leaderboard_id']]} ${timeElapsed(liveGbPlayers[playerName]['started'])}m ago</p>`
      )
    })
  }
}


// this function takes a start time and returns the time in minutes since the start time
function timeElapsed (startedTime) {
  const timeElapsed = Math.floor(((Date.now()/1000) - startedTime)/60)
  return timeElapsed
}
let timeFinished = Math.floor((Date.now()))
console.log('time taken for JS code to execute:', timeFinished-timeStarted, 'ms')

// loading identifier is name of the section 
function stopLoadingAnimation(loadingIdentifier) {
  console.log(`stopping the ${loadingIdentifier} loading animation`)
  document.getElementById(loadingIdentifier).classList.toggle('display-none')
}


