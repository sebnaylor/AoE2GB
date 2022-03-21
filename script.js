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
  fetch('https://aoe2.net/api/matches?game=aoe2de&count=10&since=1647710738')
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
    document.getElementById('current-games-list').insertAdjacentHTML("beforeend", `<div class="live-game"><p>No. of players: ${match['players'].length}. Map type: ${mapTypes[match['map_type']]}</p></div>`);
  });
}

// this function will check who's playing a live game and insert the match into the current games section
function insertPlayersIntoStatusTables (gbMatches) {

}