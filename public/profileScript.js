import {matchOutcome, timeElapsed, stopLoadingAnimation, countryCheck, insertPlayersIntoLeaderboard, sortGamesByTime, ladderTypeGrammar} from "./functions.js"

getGamesbyProfile()

async function getGamesbyProfile () {
    const response = await (await fetch('https://aoe2.net/api/player/matches?game=aoe2de&profile_id=292104&count=20')).json()
    console.log(response)
}