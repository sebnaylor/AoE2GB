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
let community = [
  {name:'AC', steam_id:'76561198803731676'},
  {name:'Alfred', steam_id:'76561198122298655'},
  {name:'Aten', steam_id:'76561198113813670'},
  {name:'Aristocats', steam_id:'76561198041753213'},
  {name:'Beanie', steam_id:'76561198203712612'},
  {name:'Bot Marley', steam_id:'76561198056640339'},
  {name:'CaptainO', steam_id:''},
  {name:'Carlini', steam_id:''},
  {name:'cdplayer', steam_id:'76561198010136971'},
  {name:'Crouch', steam_id:'76561198924852470'},
  {name:'Chris Pelham', steam_id:'76561199040121664'},
  {name:'DanMT', steam_id:'76561198076329437'},
  {name:'Darvoi', steam_id:'76561198067430187'},
  {name:'dave', steam_id:'76561198140135453'},
  {name:'Degaussed', steam_id:'76561198002663454'},
  {name:'egg', steam_id:'76561198043890292'},
  {name:'Fanjita', steam_id:'76561198001997423'},
  {name:'Hallis', steam_id:'76561198061054857'},
  {name:'Hot Beef', steam_id:'76561198025277826'},
  {name:'IamMike_', steam_id:'76561198313552709'},
  {name:'James', steam_id:'76561197972333869'},
  {name:'JBR', steam_id:'76561198007478783'},
  {name:'Kai', steam_id:'76561199091134095'},
  {name:'King Boo', steam_id:'76561198245164292'},
  {name:'Nathanael', steam_id:'76561197983443595'},
  {name:'Nick', steam_id:''},
  {name:'Pete26196', steam_id:'76561198088359350'},
  {name:'RecoN', steam_id:'76561198134451129'},
  {name:'Rhea', steam_id:'76561198259669186'},
  {name:'Rgeadn', steam_id:'76561198033589758'},
  {name:'robo_boro', steam_id:''},
  {name:'Soltou', steam_id:'76561198813523983'},
  {name:'Steak', steam_id:'76561198040347770'},
  {name:'Squeaker', steam_id:'76561198124562338'},
  {name:'Tarsiz', steam_id:''},
  {name:'Tea', steam_id:'76561198109315523'},
  {name:'The_Fish', steam_id:'76561198005323416'},
  {name:'TheMole', steam_id:''},
  {name:'Toady', steam_id:'76561198029951106'},
  {name:'Unrivalled Super Hottie', steam_id:'76561197995194212'},
  {name:'willdbeast', steam_id:'76561198119545611'},
  {name:'Wuffles', steam_id:''},
  {name:'YoungPanda95', steam_id:''},
]

document.getElementById('about-btn').addEventListener('click', function() { document.getElementById('about-txt').classList.toggle("display-none") }, false);
document.getElementById('status-btn').addEventListener('click', function() { document.getElementById('status-txt').classList.toggle("display-none") }, false);

// Console log the error if initialiseStrings doesnt run
initialiseStrings().catch( error => {
  console.log(error)
  console.log("aoe2.net api is down")
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
  const response = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=10000')).json()
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
  console.log('gbLeaderboard', gbLeaderboard)
}

function insertPlayersIntoLeaderboard (gbLeaderboard) {
  stopLoadingAnimation('leaderboard-loader')
  document.getElementById('table-head').insertAdjacentHTML("beforeend", 
  `<tr>
    <th scope="col" class="left-align light-weight">Name</th>
    <th scope="col" class="left-align light-weight">Elo</th>
  </tr>`
  )
  gbLeaderboard.forEach((player) => {
    document.querySelector('.player-table-body').insertAdjacentHTML("beforeend", 
    `<tr>
      <th scope="row" class="left-align player-name leaderboard-player">${player['name']}</th>
      <td class="leaderboard-elo">${player['rating']}</td>
    </tr>`
    );
  });
}

getCurrentMatches()

async function getCurrentMatches () {
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
          liveGbMatches.push(match)
        } else if (communityPlayer.steam_id === player.steam_id && match['finished'] != null) {
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
  sortGamesByTime(pastGbMatches)
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
        `<div class="live-game">
          <div class="game-header">
            <div class= "grid-container-1v1-team-1">  
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="${team1Player1['country']} Flag">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]} civilisation">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <h4 class="right-align ${matchOutcome(team1Player1)} player-name">${team1Player1['name']}</h4>
            </div>
            <h4>Vs</h4>
            <div class="grid-container-1v1-team-2">
              <h4 class="${matchOutcome(team2Player1)} player-name">${team2Player1['name']}</h4>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]} civilisation">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="${team2Player1['country']} Flag">
            </div>
          </div>
          <div class="elo">
            <p>${team1Player1['rating']}</p>
            <p>Elo</p>
            <p>${team2Player1['rating']}</p>
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i> ${mapTypes[match['map_type']]}
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
          </div>
        </div>`)
      } else if (match['players'].length === 4) {
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4 class="${matchOutcome(team1Player1)}">Team 1</h4>
            <h4>Vs</h4>
            <h4 class="${matchOutcome(team2Player1)}">Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align player-name">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player2['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="player-name right-align">${team1Player2['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player2['country'])} alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo</p>
            <p>${team2EloAvg}</p>
          </div>
          <div class="game-properties">
            <p>${timeElapsed(match['started'])}m ago</p>
            <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
            <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
          </div>
        </div>
      </div>`)
      } else if (match['players'].length === 6){
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4 class="${matchOutcome(team1Player1)}">Team 1</h4>
            <h4>Vs</h4>
            <h4 class="${matchOutcome(team2Player1)}">Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player2['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player3['country'])} alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align">${team1Player3['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player2['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player3['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player3['country'])} alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
        <div class="elo">
          <p>${team1EloAvg}</p>
          <p>Elo</p>
          <p>${team2EloAvg}</p>
        </div>
        <div class="game-properties">
          <p>${timeElapsed(match['started'])}m ago</p>
          <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
          <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
        </div>
      </div>
      `)
      }  else if (match['players'].length === 8){
        document.querySelector('.recently-completed-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
          <div class="team-game-header">
            <h4 class="${matchOutcome(team1Player1)}">Team 1</h4>
            <h4>Vs</h4>
            <h4 class="${matchOutcome(team2Player1)}">Team 2</h4>
          </div>
        <div class="team-game-teams">
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align player-name">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player2['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align player-name">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player3['country'])} alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align player-name">${team1Player3['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player4['country'])} alt="${civs[team1Player4['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player4['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player4['color']}">${team1Player4['color']}</p>
              <p class="right-align player-name">${team1Player4['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player2['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player3['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player4['name']}</p>
              <p class="player p${team2Player4['color']}">${team2Player4['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player4['civ']].toLowerCase()}.png" alt="${civs[team2Player4['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player4['country'])} alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
        <div class="elo">
          <p>${team1EloAvg}</p>
          <p>Elo</p>
          <p>${team2EloAvg}</p>
        </div>
        <div class="game-properties">
          <p>${timeElapsed(match['started'])}m ago</p>
          <p><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
          <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
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
  sortedMatches = matches.sort((a, b) => b['opened']-a['opened'])
  return sortedMatches
}

function insertLiveGames (liveGbMatches) {
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

      if (match['players'].length % 2 != 0){
        exit
      } else if (match['players'].length === 2) {
        document.querySelector('.current-games').insertAdjacentHTML("beforeend",
        `<div class="live-game">
        <div class="game-header">
          <div class= "grid-container-1v1-team-1">  
            <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="${team1Player1['country']} Flag">
            <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]} civilisation">
            <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
            <h4 class="right-align player-name">${team1Player1['name']}</h4>
          </div>
          <h4>Vs</h4>
          <div class="grid-container-1v1-team-2">
            <h4 class="player-name">${team2Player1['name']}</h4>
            <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
            <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]} civilisation">
            <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="${team2Player1['country']} Flag">
          </div>
        </div>
        <div class="elo">
          <p>${team1Player1['rating']}</p>
          <p>Elo</p>
          <p>${team2Player1['rating']}</p>
        </div>
        <div class="game-properties">
          <p>${timeElapsed(match['started'])}m ago</p>
          <p><i class="fa-solid fa-earth-americas"></i> ${mapTypes[match['map_type']]}
          <p><i class="fa-solid fa-server"></i> ${match['server']}</p>
          <a class="spectate-btn" href="https://aoe2.net/s/${match['match_id']}">Spectate</a></p>
        </div>
      </div>`)
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
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align player-name">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player2['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align player-name">${team1Player2['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player2['country'])} alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo</p>
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
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="${civs[team1Player1['civ']]}">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align player-name">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player2['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align player-name">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player3['country'])} alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align player-name">${team1Player3['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player2['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player3['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player3['country'])} alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo</p>
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
              <img id="country-flag" src=${countryCheck(team1Player1['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player1['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player1['color']}">${team1Player1['color']}</p>
              <p class="right-align player-name">${team1Player1['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player2['country'])} alt="">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player2['civ']].toLowerCase()}.png" alt="${civs[team1Player2['civ']]}">
              <p class="player p${team1Player2['color']}">${team1Player2['color']}</p>
              <p class="right-align player-name">${team1Player2['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player3['country'])} alt="${civs[team1Player3['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player3['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player3['color']}">${team1Player3['color']}</p>
              <p class="right-align player-name">${team1Player3['name']}</p>
            </div>
            <div class="team-game-player grid-container-team-1">
              <img id="country-flag" src=${countryCheck(team1Player4['country'])} alt="${civs[team1Player4['civ']]}">
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player4['civ']].toLowerCase()}.png" alt="">
              <p class="player p${team1Player4['color']}">${team1Player4['color']}</p>
              <p class="right-align player-name">${team1Player4['name']}</p>
            </div>
          </div>     
          <div class="team-game-team-column">
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player1['name']}</p>
              <p class="player p${team2Player1['color']}">${team2Player1['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player1['civ']].toLowerCase()}.png" alt="${civs[team2Player1['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player1['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player2['name']}</p>
              <p class="player p${team2Player2['color']}">${team2Player2['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player2['civ']].toLowerCase()}.png" alt="${civs[team2Player2['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player2['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player3['name']}</p>
              <p class="player p${team2Player3['color']}">${team2Player3['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player3['civ']].toLowerCase()}.png" alt="${civs[team2Player3['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player3['country'])} alt="">
            </div>
            <div class="team-game-player grid-container-team-2">
              <p class="player-name">${team2Player4['name']}</p>
              <p class="player p${team2Player4['color']}">${team2Player4['color']}</p>
              <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player4['civ']].toLowerCase()}.png" alt="${civs[team2Player4['civ']]}">
              <img id="country-flag" src=${countryCheck(team2Player4['country'])} alt="">
            </div>
          </div>
        </div>
        <div class="game-info">
          <div class="elo">
            <p>${team1EloAvg}</p>
            <p>Elo</p>
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
    `<p class="center-align no-players">No players have started a game recently</p>`)
  } else {
  keys = Object.keys(liveGbPlayers)
    keys.forEach((playerName) => {
      document.getElementById('status-table').insertAdjacentHTML("beforeend",
      `<p class="left-align light-weight status-player"><strong>${playerName}</strong> started a ${leaderboardTypes[liveGbPlayers[playerName]['leaderboard_id']]} ${timeElapsed(liveGbPlayers[playerName]['started'])}m ago</p>`
      )
    })
  }
}


// this function takes a start time and returns the time in minutes since the start time
function timeElapsed (startedTime) {
  const timeElapsed = Math.floor(((Date.now()/1000) - startedTime)/60)
  return timeElapsed
}

// loading identifier is name of the section 
function stopLoadingAnimation(loadingIdentifier) {
  document.getElementById(loadingIdentifier).classList.toggle('display-none')
}

function countryCheck(country) {
  if (country == null) {
    console.log('undefined country', country)
    return `https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/undefined.png`
  } else {
    return `https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${country.toLowerCase()}.png`
  }
}

function matchOutcome(player) {
  if(player['won'] === true) {
    return "victor"
  } else {
    return "loser"
  }

}