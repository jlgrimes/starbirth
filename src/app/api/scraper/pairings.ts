const axios = require("axios");
import { load } from 'cheerio';
import { BASE_RK9_PAIRINGS_URL } from './constants';

type AgeDivision = 'juniors' | 'seniors' | 'masters';

const getPairingsUrl = (rk9Slug: string, ageDivision: AgeDivision, roundNumber: number) => {
  const podNumber = ageDivision === 'juniors' ? 0 : ageDivision === 'seniors' ? 1 : 2;
  return `${BASE_RK9_PAIRINGS_URL}/${rk9Slug}?pod=${podNumber}&rnd=${roundNumber}`;
}

export const scrapePairings = async (rk9Slug: string) => {
  const pairingsUrl = `${BASE_RK9_PAIRINGS_URL}/${rk9Slug}`;

  const response = await axios.get(pairingsUrl);
  const $ = load(response.data);

  const mastersRoundNumber = $('a:contains("Masters in Round")').text().split(' ').at(-1);
  console.log(mastersRoundNumber);
}