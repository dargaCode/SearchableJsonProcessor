
function saveProcessedData(savePath, processedData) {
  const fs = require('fs');
  const jsonString = JSON.stringify(processedData);

  console.log('Saving processed data JSON...\n');
  fs.writeFile(savePath, jsonString, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(jsonString);
      console.log(`\n${savePath} saved!`);
    }
  });
}

(function main() {

  const PATHS = {
    TRIE_CLASS: './Trie.js',
    JSON_PROCESSOR: './JsonProcessor.js',
    RAW_DATA_JSON: './data/data-raw.json',
    PROCESSED_DATA_JSON: './data/data-searchable.json',
  }

  const JsonProcessor = require(PATHS.JSON_PROCESSOR);
  // pass the raw json's top-level key if it has one, else null
  const entryArrayKey = 'books';
  const startingId = 10000;

  const jsonProcessor = new JsonProcessor(PATHS, entryArrayKey, startingId);

  // pass a callback with which to assemble the entry's keyword
  const processedData = jsonProcessor
    .processDataEntries(function(entry) {
      const entryKey = `${entry.title} by ${entry.author}`;

      return entryKey;
  });

  saveProcessedData(
    PATHS.PROCESSED_DATA_JSON,
    processedData
  );
}());
