console.log("Hello From JavaScript!")
let civs = {}
// getLeaderboard

// Setting the community steam IDs. Move this to a .env file before going live
let community = {
  'Rhea': '76561198259669186',
  'Crouch': '76561198924852470',
  'Alfred': '76561198122298655',
  'Fanjita': 'fanjitatowels',
  'IamMike_': '76561198313552709',
  'DanMT': '76561198076329437',
  'Aten': '76561198113813670',
  'Tea': '76561198109315523',
  'Toady': '76561198029951106',
  'King Boo': 'hrh_king_boo',
  'Bot Marley': 'xBotMarley',
  'Hallis': 'Matthew5552',
  'Steak': '76561198040347770'
}
// Console log the error if populateCivs doesnt run
populateCivs().catch( error => {
  console.log(error.error)
})

// Assigning game civs from API to local memory so that I can get the civ name with only a civ ID
async function populateCivs () {
  const response = await (await fetch('https://aoe2.net/api/strings?game=aoe2de&language=en')).json()
  response['civ'].forEach((civ) => {
    civs[civ['id']] = civ['string']
  });
}

console.log(civs)

getLeaderboard()

async function getLeaderboard () {
  const response = await (await fetch('https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&start=1&count=2')).json()
  let globalLeaderboard = response['leaderboard']
  let gbLeaderboard = globalLeaderboard.filter(
    player => player['steam_id'] === "76561198116921964"
  )
  console.log(gbLeaderboard)
}


