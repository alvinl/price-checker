
var SEARCH_API = 'https://open-market.alvinl.com/api/search?limit=5&name=',
    PRICE_API  = 'https://open-market.alvinl.com/api/prices?item=%itemName&appID=%appID';

module.exports = function (stem) {

  stem.api.addCommand(/pc (.*)/, function (steamID, command) {

    var itemName = command.match[1];

    stem.api.request({ json: true, url: SEARCH_API + itemName }, function (err, response, body) {

      if (err || response.statusCode !== 200)
        return stem.bot.sendMessage(steamID, 'Sorry, there was an error looking up this item');

      // No results found for `itemName`
      else if (!body.results.length)
        return stem.bot.sendMessage(steamID, 'Sorry, I could not find this item');

      var itemSearchResults = body.results,
          item              = body.results[0];

      var priceRequest = {

        json: true,
        url:  PRICE_API
                .replace('%itemName', item.name)
                .replace('%appID', item.appID)

      };

      // Get the items price history
      stem.api.request(priceRequest, function (err, response, body) {

        if (err || response.statusCode !== 200)
          return stem.bot.sendMessage(steamID, 'Sorry, there was an error looking up this items price history');

        // No price history for this item
        else if (!body.history.length)
          return stem.bot.sendMessage(steamID, 'Sorry, this item does not have a price history. Check back later');

        stem.bot.sendMessage(steamID, 'Last known median price for %itemName is $%itemPrice'
                                        .replace('%itemName', item.name)
                                        .replace('%itemPrice', body.history[0].price / 100));

        // Check if there other items to suggest
        if (itemSearchResults.length === 1)
          return;

        var itemSuggestions = itemSearchResults.map(function (itemSuggestion) {

          return itemSuggestion.name;

        }).join('\n');

        stem.bot.sendMessage(steamID, 'Other item suggestions:\n' + itemSuggestions);

      });

    });

  });

};
