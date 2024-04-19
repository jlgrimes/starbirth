const axios = require("axios");
import { load } from 'cheerio';
import { RK9_EVENT_URL } from './constants';

/**
 * @param name - Name of the tournament;
 * @param eventDates - General dates of the event to be displayed. Ex April 3-5.
 * @param location - String representation of the location of the venue.
 * @param links - Links for each of the specific event pages.
 */
interface TournamentInformation {
  name: string;
  dates: string;
  location: string;
  links: {
    tcg: string | undefined;
    vgc: string | undefined;
    go: string | undefined;
    spectators: string | undefined;
  }
}

export const scrapeTournaments = async (): Promise<TournamentInformation[]> => {
  const response = await axios.get(RK9_EVENT_URL);
  const $ = load(response.data);

  const pastTournaments: TournamentInformation[] = [];
  $('table#dtPastEvents > tbody').children('tr').each((i, el) => {
    const event = $(el);
    const eventMetadata = event.children('td').toArray()

    if (eventMetadata.length === 5) {
      const [dateNode, _, titleNode, locationNode, linksNode] = eventMetadata;

      const tournamentDates = $(dateNode).text();
      const tournamentName = $(titleNode).text().trim();
      const tournamentLocation = $(locationNode).text();

      const goLink = $(linksNode).find('a:contains("GO")').attr()?.['href']
      const tcgLink = $(linksNode).find('a:contains("TCG")').attr()?.['href']
      const vgcLink = $(linksNode).find('a:contains("VG")').attr()?.['href']
      const spectatorsLink = $(linksNode).find('a:contains("Spectators")').attr()?.['href']

      pastTournaments.push({
        name: tournamentName,
        dates: tournamentDates,
        location: tournamentLocation,
        links: {
          tcg: tcgLink,
          vgc: vgcLink,
          go: goLink,
          spectators: spectatorsLink
        }
      })
    }
  });

  return pastTournaments;
}