const matchOutcome = (player) => {
    if(player['won'] === null) {
      return ""
    } else if (player['won'] === true){
      return "victor"
    } else {
    	return "loser"
    }
}

const timeElapsed = (startedTime) => {
    const timeElapsed = Math.floor(((Date.now()/1000) - startedTime)/60)
    return timeElapsed
}  

// loading identifier is name of the section 
const stopLoadingAnimation = (loadingIdentifier) => {
    document.getElementById(loadingIdentifier).classList.toggle('display-none')
}

const countryCheck = (country) => {
    if (country == null) {
      console.log('undefined country', country)
      return `https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/undefined.png`
    } else {
      return `https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Flags/${country.toLowerCase()}.png`
    }
}

const insertPlayersIntoLeaderboard = (gbLeaderboard) => {
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
      <th scope="row" class="left-align player-name leaderboard-player"><a href="https://aoe2.net/#profile-${player.profile_id}" target="_blank" rel="noopener noreferrer">${player['name']}</a></th>
      <td class="leaderboard-elo">${player['rating']}</td>
    </tr>`
    );
  });
}

const sortGamesByTime = (matches) => {
    const sortedMatches = matches.sort((a, b) => b['opened']-a['opened'])
    return sortedMatches
}

const ladderTypeGrammar = (mapType) => {
  if (mapType === "Unranked") {
    return "an Unranked"
  } else if (mapType === undefined) {
    return "an Undefined Game"
  } else {
  return `a ${mapType}`}
}



// use this function for all 1v1 games in dashboardScript (dif html structure to team games)
const html1v1Game = (civs, mapTypes, cssMatchType, match, team1Player, team2Player) => {
  return `<div class="game">
    <div class="game-header">
      <div class= "grid-container-${cssMatchType}-team-1">  
        <img id="country-flag" src=${countryCheck(team1Player['country'])} alt="${team1Player['country']} Flag">
        <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team1Player['civ']].toLowerCase()}.png" alt="${civs[team1Player['civ']]} civilisation">
        <p class="player p${team1Player['color']}">${team1Player['color']}</p>
        <a href="https://aoe2.net/#profile-${team1Player.profile_id}" target="_blank" rel="noopener noreferrer"><h4 class="right-align ${matchOutcome(team1Player)} player-name">${team1Player['name']}</h4></a>
      </div>
      <h4>Vs</h4>
      <div class="grid-container-${cssMatchType}-team-2">
        <a href="https://aoe2.net/#profile-${team2Player.profile_id}" target="_blank" rel="noopener noreferrer"><h4 class="${matchOutcome(team2Player)} player-name">${team2Player['name']}</h4></a>
        <p class="player p${team2Player['color']}">${team2Player['color']}</p>
        <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[team2Player['civ']].toLowerCase()}.png" alt="${civs[team2Player['civ']]} civilisation">
        <img id="country-flag" src=${countryCheck(team2Player['country'])} alt="${team2Player['country']} Flag">
      </div>
    </div>
    `
}

const htmlTeamGamePlayerTeam1 = (civs, player) => {
  return `
  <div class="team-game-player grid-container-tg-team-1">
    <img id="country-flag" src=${countryCheck(player['country'])} alt="">
    <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[player['civ']].toLowerCase()}.png" alt="">
    <p class="player p${player['color']}">${player['color']}</p>
    <a href="https://aoe2.net/#profile-${player.profile_id}" target="_blank" rel="noopener noreferrer"><p class="right-align player-name">${player['name']}</p></a>
  </div>
  `
}

const htmlTeamGamePlayerTeam2 = (civs, player) => {
  return `
  <div class="team-game-player grid-container-tg-team-2">
    <a href="https://aoe2.net/#profile-${player.profile_id}" target="_blank" rel="noopener noreferrer"><p class="player-name">${player['name']}</p></a>
    <p class="player p${player['color']}">${player['color']}</p>
    <img src="https://aoe2gb.s3.eu-west-2.amazonaws.com/images/Civs/${civs[player['civ']].toLowerCase()}.png" alt="">
    <img id="country-flag" src=${countryCheck(player['country'])} alt="">    
  </div>
  `
}

const gameInfo = (mapTypes, match, team1EloAvg, team2EloAvg) => {
  return `
    <div class="game-info">
      <div class="elo">
        <p class="light-weight">${team1EloAvg}</p>
        <p class="light-weight">Elo</p>
        <p class="light-weight">${team2EloAvg}</p>
      </div>
      <div class="game-properties">
        <p class="light-weight">${timeElapsed(match['started'])}m ago</p>
        <p class="light-weight"><i class="fa-solid fa-earth-americas"></i>${mapTypes[match['map_type']]}</p>
        <p class="light-weight"><i class="fa-solid fa-server"></i> ${match['server']}</p>
        <a class="spectate-btn ${match['finished']== null ? '' : 'display-none'}" href="https://aoe2.net/s/${match['match_id']}">Spectate</a>
      </div>
    </div>`
}

// const about = document.getElementById('about-btn').addEventListener('click', const() { document.getElementById('about-txt').classList.toggle("display-none") }, false);
// const status = document.getElementById('status-btn').addEventListener('click', const() { document.getElementById('status-txt').classList.toggle("display-none") }, false);

export {
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
}
