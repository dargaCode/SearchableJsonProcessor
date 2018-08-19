
(function main() {

  const PATHS = {
    TRIE_CLASS: './Trie.js',
    JSON_PROCESSOR: './JsonProcessor.js',
    RAW_DATA_JSON: './data/data-raw.json',
    PROCESSED_DATA_JSON: './data/data-searchable.json',
  }

  const JsonProcessor = require(PATHS.JSON_PROCESSOR);
  const entryArrayKey = 'books';
  const startingId = 10000;

  const jsonProcessor = new JsonProcessor(PATHS, entryArrayKey, startingId);

  jsonProcessor.processDataEntries(function(entry) {
      const entryKey = `${entry.title} by ${entry.author}`;

      return entryKey;
  });
  jsonProcessor.saveProcessedData();
}());
