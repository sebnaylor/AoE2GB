// const cors = require('cors');
// app.use(
//   cors({
//     origin: 'http://127.0.0.1:8080/'
//   })
// );
let civs = {}

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
  {name:'CurrentMatchesTest', steam_id: '76561198104793947'}
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
  
  // getLeaderboard
// getLeaderboard().catch( error => {
//   console.log(error.error)
// })

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
  fetch('https://aoe2.net/api/matches?game=aoe2de&count=10&since=1647610766')
  .then(response => response.json())
  .then(currentMatches => {
    console.log(currentMatches)
    filterCommunityMatches(currentMatches)
  });


}
let gbMatches = []
// this function wil take the community and a global list of current matches and filter to only show matches with community players
function filterCommunityMatches(globalMatches) {
  console.log('global matches:')
  console.log(globalMatches)
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
}
console.log(gbMatches)
