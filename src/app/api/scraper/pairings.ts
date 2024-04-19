const axios = require("axios");
import { load } from 'cheerio';
import { BASE_RK9_PAIRINGS_URL } from './constants';

type AgeDivision = 'juniors' | 'seniors' | 'masters';
type MatchResult = 'win' | 'loss' | 'tie';

interface TournamentRecord {
  wins: number;
  ties: number;
  losses: number;
}

interface PlayerAbstract {
  name: string;
  region: string;
  record: TournamentRecord;
}

interface Match {
  opponent: string;
  result: MatchResult;
}

interface Player extends PlayerAbstract {
  matches: Match[];
}

const getPairingsUrl = (rk9Slug: string, ageDivision: AgeDivision, roundNumber: number) => {
  const podNumber = ageDivision === 'juniors' ? 0 : ageDivision === 'seniors' ? 1 : 2;
  return `${BASE_RK9_PAIRINGS_URL}/${rk9Slug}?pod=${podNumber}&rnd=${roundNumber}`;
}

const getPlayerAbstractFromDisplayText = (text: string): PlayerAbstract => {
  const matchesWithRegion = /(.*)\[(.*)\] \((\d+)-(\d+)-(\d+)\)/.exec(text.trim());
  const matchesWithoutRegion = /(.*)() \((\d+)-(\d+)-(\d+)\)/.exec(text.trim());
  const finalMatches = matchesWithRegion ?? matchesWithoutRegion;
  if (!finalMatches) throw `Player has no matches: ${text.trim()}`;

  const [_, name, region, wins, losses, ties] = finalMatches;
  return {
    name: name.trim(),
    region: region,
    record: {
      wins: parseInt(wins),
      ties: parseInt(ties),
      losses: parseInt(losses)
    }
  }
}

export const scrapePairings = async (rk9Slug: string) => {
  const pairingsUrl = `${BASE_RK9_PAIRINGS_URL}/${rk9Slug}`;

  const response = await axios.get(pairingsUrl);
  const $ = load(response.data);
  const mastersRoundNumber = $('a:contains("Masters in Round")').text().split(' ').at(-1);

  if (!mastersRoundNumber) throw 'Masters round undefined';
  
  const players: Player[] = [];

  const getExistingPlayerIndex = (name: string) => players.findIndex((existingPlayer) => existingPlayer.name === name);

  for (const roundNumber of Array.from( { length: parseInt(mastersRoundNumber) }, (x, i) => i + 1 )) {
    console.log(`Loading round ${roundNumber}...`)

    const response = await axios.get(getPairingsUrl(rk9Slug, 'masters', roundNumber));
    const $ = load(response.data);
    
    $('body > div').each((i, table) => {
      const [firstPlayerNode, tableNumber, secondPlayerNode] = $(table).children('div').toArray()

      // Removes instances of players who were dropped/no-show/kicked
      if ($(secondPlayerNode).text().length > 0) {
        const firstPlayer = getPlayerAbstractFromDisplayText($(firstPlayerNode).text());
        const secondPlayer = getPlayerAbstractFromDisplayText($(secondPlayerNode).text());
        const bothPlayers = [firstPlayer, secondPlayer];
  
        for (const playerIdx of [0, 1]) {
          const currentPlayer = bothPlayers[playerIdx];
          const opponentPlayer = playerIdx === 0 ? secondPlayer : firstPlayer;
  
          // TODO: Implement the logic for duplicate names. This just overrides them.
          const existingPlayerIdx = getExistingPlayerIndex(currentPlayer.name);
  
          if (existingPlayerIdx >= 0) {
            players[existingPlayerIdx] = {
              ...currentPlayer,
              matches: [
                ...players[existingPlayerIdx].matches, {
                  opponent: opponentPlayer.name,
                  // TODO: Implement logic for the results
                  result: 'win'
                }
              ]
            };
          } else {
            players.push({
              ...currentPlayer,
              matches: [{
                opponent: opponentPlayer.name,
                // TODO: Implement logic for the results
                result: 'win'
              }]
            });
          }
        }
      }
    });
  }

  return players;
}