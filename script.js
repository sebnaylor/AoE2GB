let civs = {}
// getLeaderboard

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
  {name:'Steak', steam_id:'76561198040347770'}
]
// Console log the error if populateCivs doesnt run
// populateCivs().catch( error => {
//   console.log(error.error)
// })

// Assigning game civs from API to local memory so that I can get the civ name with only a civ ID
async function populateCivs () {
  // not sure why I need 2 awaits in the line below. it breaks with just 1 
  const response = await (await fetch('https://aoe2.net/api/strings?game=aoe2de&language=en')).json()
  response['civ'].forEach((civ) => {
    civs[civ['id']] = civ['string']
  });
}

// getLeaderboard().catch( error => {
//   console.log(error.error)
// })

async function getLeaderboard () {
  const response = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=3000')).json()
  let globalLeaderboard = response['leaderboard']
  filterCommunity(globalLeaderboard)
}

// this function wil take the community and a global leaderboard and filter to only show community players
function filterCommunity (globalLeaderboard) {
  console.log(globalLeaderboard)
  console.log('community')
  console.log(community)
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

async function getCurrentMatches () {
  const response = await (await fetch(''))
}