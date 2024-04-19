const axios = require("axios");
import cheerio from 'cheerio';

const RK9_EVENT_URL = 'https://rk9.gg/events/pokemon';

export async function POST(req: Request) {
  try {
    const response = await axios.get(RK9_EVENT_URL);
    const $ = cheerio.load(response.data);
    console.log(response)

    $('table#dtPastEvents > tbody').children('tr').each((i, el) => {
      console.log(el);
    });

    return Response.json({ message: 'Successfully scraped', code: 200 })
  } catch (error) {
    console.error(error);

    return Response.json({ message: 'Error scraping', code: 500 })
  }
}