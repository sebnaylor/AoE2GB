function matchOutcome(player) {
    if(player['won'] === null) {
      return ""
    } else if (player['won'] === true){
      return "victor"
    } else {
    	return "loser"
    }
}

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

function sortGamesByTime (matches) {
    const sortedMatches = matches.sort((a, b) => b['opened']-a['opened'])
    return sortedMatches
}

function ladderTypeGrammar (mapType) {
  if (mapType === "Unranked") {
    return "an Unranked"
  } else if (mapType === undefined) {
    return "an Undefined Game"
  } else {
  return `a ${mapType}`}
}

const about = document.getElementById('about-btn').addEventListener('click', function() { document.getElementById('about-txt').classList.toggle("display-none") }, false);
const status = document.getElementById('status-btn').addEventListener('click', function() { document.getElementById('status-txt').classList.toggle("display-none") }, false);

export {matchOutcome, timeElapsed, stopLoadingAnimation, countryCheck, insertPlayersIntoLeaderboard, sortGamesByTime, about, status, ladderTypeGrammar}