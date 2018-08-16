const JsonProcessor = require('./JsonProcessor.js');

(function main() {

  const PATHS = {
    TRIE_CLASS: './Trie.js',
    RAW_DATA_JSON: './data/data-raw.json',
    PROCESSED_DATA_JSON: './data/data-searchable.json',
  }

  const ENTRY_ARRAY_KEY = 'books';
  const STARTING_ID = 10000;

  // DEPENDENCIES

  const Trie = require(PATHS.TRIE_CLASS);
  const jsonData = require(PATHS.RAW_DATA_JSON);




  const entryArrayKey = 'books';
  const startingId = 10000;

  const jsonProcessor = new JsonProcessor(PATHS, entryArrayKey, startingId);

  jsonProcessor.processDataEntries(function(entry) {
      const key = `${entry.title} by ${entry.author}`;
      console.log(key);

      return key;
  });
  jsonProcessor.saveProcessedData();
}());
