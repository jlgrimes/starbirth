const axios = require("axios");
import cheerio from 'cheerio';
import { scrapeTournaments } from './tournaments';

export async function POST(req: Request) {
  try {
    const tournaments = await scrapeTournaments();

    return Response.json({ message: 'Successfully scraped', code: 200 })
  } catch (error) {
    console.error(error);

    return Response.json({ message: 'Error scraping', code: 500 })
  }
}