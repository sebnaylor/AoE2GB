let civs = {}
let mapTypes = {}
let mapSizes = {}
let gameTypes = {}
let leaderboardTypes = {}

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
  {name:'CurrentMatchesTest', steam_id: '76561198104793947'},
  {name:'seafood', steam_id: '76561198350566117'},
  {name:'Canary', steam_id: '76561199043818620'},
  {name:'yummy', steam_id: '76561198863514740'},
  {name:'Ozone', steam_id: '76561198826220092'},
  {name:'Jordan23', steam_id: '76561198400058723'},
  {name:'Vilese', steam_id: '76561198325239137'},
  {name:'Meteor', steam_id: '76561198399553801'}
]
// Console log the error if populateCivs doesnt run
populateCivs().catch( error => {
    console.log(error.error)
  })

  // Assigning civs, map types and map sizes from API to local memory so that I can get strings with just ID without any more API queries
async function populateCivs () {
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
  
  getLeaderboard
getLeaderboard().catch( error => {
  console.log(error.error)
})

async function getLeaderboard () {
  const response = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=3000')).json()
  ;let globalLeaderboard = response['leaderboard']
  filterCommunityLeaderboard(globalLeaderboard)
}

// this function wil take the community and a global leaderboard and filter to only show community players
function filterCommunityLeaderboard (globalLeaderboard) {
  // console.log(globalLeaderboard)
  // console.log('community')
  // console.log(community)
  const gbLeaderboard = globalLeaderboard.filter((player) => {
    return community.some((communityPlayer) => {
      return communityPlayer.steam_id === player.steam_id
    });
  });
  insertPlayersIntoLeaderboard(gbLeaderboard)
}

function insertPlayersIntoLeaderboard (gbLeaderboard) {
  gbLeaderboard.forEach((player) => {
    document.getElementById('leaderboard-list').insertAdjacentHTML("beforeend", `<li> Name: ${player.name} - ${player.rating} </li>`);
  });
}

getCurrentMatches()

async function getCurrentMatches () {
  console.log('getting current matches..')
  // const date = (Date.now()-10800000).toString
  // const dateString = date.toString
  // console.log(dateString)

  // need to update this url with current epoch - 3 hours
  fetch('https://aoe2.net/api/matches?game=aoe2de&count=100&since=1647710738')
  .then(response => response.json())
  .then(currentMatches => {
    console.log('current matches', currentMatches)
    filterCommunityMatches(currentMatches)
  });


}
let gbMatches = []
// this function wil take the community and a global list of current matches and filter to only show matches with community players
function filterCommunityMatches(globalMatches) {
  globalMatches.forEach((match) => {
    return community.some((communityPlayer) => {
      match['players'].forEach((player) => {
        if (communityPlayer.steam_id === player.steam_id) {
          console.log('Eureka! A match is being played right now by a community member')
          console.log(match)
          gbMatches.push(match)
        }
        return communityPlayer.steam_id === player.steam_id
      });
    });
  });
  console.log(gbMatches) 
  insertLiveGames(gbMatches)
}


function insertLiveGames (gbMatches) {
  gbMatches.forEach((match) => {
    console.log('match', match)
    if (match['players'].length === 2) {
      document.getElementById('current-games').insertAdjacentHTML("beforeend",
      `<div class="live-game">
        <div class="game-header">
          <img src="assets/images/Civs/${civs[match['players'][0]['civ']]}.png" alt="${civs[match['players'][0]['civ']]} civilisation">
          <p class="player p${match['players'][0]['color']}">${match['players'][0]['color']}</p>
          <h3>${match['players'][0]['name']}</h3>
          <h2>Vs</h2>
          <h3>${match['players'][1]['name']}</h3>
          <p class="player p${match['players'][1]['color']}">${match['players'][1]['color']}</p>
          <img src="assets/images/Civs/${civs[match['players'][1]['civ']]}.png" alt="${civs[match['players'][0]['civ']]} civilisation">
        </div>
        <div class="elo">
          <p>${match['players'][0]['rating']}</p>
          <p>ELO</p>
          <p>${match['players'][1]['rating']}</p>
        </div>
        <div class="country">
          <img src="assets/images/Flags/${match['players'][0]['country']}.png" alt="${match['players'][0]['country']} Flag">
          <p>Country</p>
          <img src="assets/images/Flags/${match['players'][1]['country']}.png" alt="${match['players'][1]['country']} Flag">
        </div>
        <div class="game-info">
          <p>Map: ${mapTypes[match['map_type']]} | Server: ${match['server']} | <a href="https://aoe2.net/s/${match['match_id']}">Spectate</a></p>
        </div>
        <div class="game-time">
          <p>Started ${timeElapsed(match['started'])}m ago</p>
        </div>`)
    } else if (match['players'].length === 4){
      document.getElementById('current-games').insertAdjacentHTML("beforeend",
      `
      <div class="live-game">
        <div class="team-game-header">
          <h3>Team 1</h3>
          <h2>Vs</h2>
          <h3>Team 2</h3>
        </div>
        <div class="team-game-player-row">
          <img id="country-flag" src="assets/images/Flags/${match['players'][0]['country']}.png" alt="${match['players'][0]['country']} Flag">
          <img src="assets/images/Civs/${civs[match['players'][0]['civ']]}.png" alt="${civs[match['players'][0]['civ']]}">
          <p class="player p${match['players'][0]['color']}">${match['players'][0]['color']}</p>
          <p>${match['players'][0]['name']}</p>
          <p>${match['players'][1]['name']}</p>
          <p class="player p${match['players'][1]['color']}">${match['players'][1]['color']}</p>
          <img src="assets/images/Civs/${civs[match['players'][1]['civ']]}.png" alt="${civs[match['players'][1]['civ']]}">
          <img id="country-flag" src="assets/images/Flags/${match['players'][1]['country']}.png" alt="${match['players'][1]['country']} Flag">
        </div>
        <div class="team-game-player-row">
          <img id="country-flag" src="assets/images/Flags/${match['players'][2]['country']}.png" alt="${match['players'][2]['country']} Flag">
          <img src="assets/images/Civs/${civs[match['players'][2]['civ']]}.png" alt="${civs[match['players'][2]['civ']]}">
          <p class="player p${match['players'][2]['color']}">${match['players'][2]['color']}</p>
          <p>${match['players'][2]['name']}</p>
          <p>${match['players'][3]['name']}</p>
          <p class="player p${match['players'][3]['color']}">${match['players'][3]['color']}</p>
          <img src="assets/images/Civs/${civs[match['players'][3]['civ']]}.png" alt="${civs[match['players'][0]['civ']]}">
          <img id="country-flag" src="assets/images/Flags/${match['players'][3]['country']}.png" alt="${match['players'][0]['country']} Flag">
        </div>
        <div class="elo">
          <p>2905</p>
          <p>ELO (avg)</p>
          <p>3045</p>
        </div>
        <div class="game-info">
          <p><i class="fa-solid fa-earth-americas"></i> Arabia | Server: UK West | Spectate</p>
        </div>
        <div class="game-time">
          <p>Started 5m ago</p>
        </div>
      </div>
    </div>
      `
      )
    } else if (match['players'].length === 6){

    }  else if (match['players'].length === 8){

    } else {
      // code for odd number of players in a match
    }
  });
}

// this function will check who's playing a live game and insert the match into the current games section
function insertPlayersIntoStatusTables (gbMatches) {

}

function timeElapsed (startedTime) {
  const timeElapsed = Math.floor(((Date.now()/1000) - startedTime)/60)
  console.log((Date.now()/1000))
  console.dir(startedTime)
  console.log('Time elapsed', timeElapsed, typeof timeElapsed)
  return timeElapsed
}