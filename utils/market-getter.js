import axios from "axios";
import { jsdom } from "jsdom-jscore-rn";

export async function getValuesOnEbay(keyword) {
  console.log("Getting value on ebay", keyword)
  var prices = [];
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://www.ebay.com/sch/2536/i.html?_from=R40&_nkw=' + keyword.toLowerCase().replace(/ /g, '+')
    };
    const data = await axios.request(config);
    var dom = jsdom(data.data);
    var elements = dom.querySelectorAll('li.s-item.s-item__pl-on-bottom');
    for (var doc of Array.from(elements)) {
      var title = doc.querySelector('div.s-item__image-wrapper.image-treatment img').getAttribute('alt');
      var img = doc.querySelector('div.s-item__image-wrapper.image-treatment img').getAttribute('src');
      var buyUrl = doc.querySelector('div.s-item__image a').getAttribute('href');
      var price = doc.querySelector('span.s-item__price').textContent.trim();

      if (buyUrl) {
        buyUrl = buyUrl.replace(/\?.*/g, '');
      }
      if (buyUrl !== 'https://ebay.com/itm/123456') {
        prices.push({ title, img, buyUrl, price })
      }
    }
    // console.log(prices);
    return prices;
  } catch (err) {
    console.log(err);
    return [];
  }
}