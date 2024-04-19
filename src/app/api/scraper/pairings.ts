const axios = require("axios");
import { load } from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
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
  // ID of the opponent the match was
  opponent: string;
  tableNumber: number;
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
  
  for (const roundNumber of Array.from( { length: parseInt(mastersRoundNumber) }, (x, i) => i + 1 )) {
    console.log(`Loading round ${roundNumber}...`)

    const response = await axios.get(getPairingsUrl(rk9Slug, 'masters', roundNumber));
    const $ = load(response.data);
    
    $('body > div').each((i, table) => {
      const [firstPlayerNode, tableNumber, secondPlayerNode] = $(table).children('div').toArray()

      const firstPlayer = getPlayerAbstractFromDisplayText($(firstPlayerNode).text());
      console.log(firstPlayer)

      // console.log(firstPlayerName, firstPlayerRegion)
    });
  }
}