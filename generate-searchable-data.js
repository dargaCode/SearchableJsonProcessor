

/*
  load the json
  process it
    increment id
    create a searchable string for each entry
    break string into multiple keys
    store id in trie by each key
    store entry by id in dict
  return processed data object?
  save json
*/

class JsonProcessor {
  constructor(paths, startingId) {
    const Trie = require(PATHS.TRIE_CLASS);
    const fs = require('fs');
    const jsonData = require(PATHS.RAW_DATA_JSON);

    this.paths = paths;
    this.id = startingId;


    this.accumulators = Object.freeze({
      entryNameSet: new Set(),
      entryTrie: new Trie(),
      entryDictL: {},
    });

  }

}








// CONSTANTS

const PATHS = {
  TRIE_CLASS: './Trie.js',
  RAW_DATA_JSON: './data/data-raw.json',
  PROCESSED_DATA_JSON: './data/data-searchable.json',
}

// does the array have a key name?
// set to null if not.
const ENTRY_ARRAY_KEY = 'books';
const STARTING_ID = 10000;

// DEPENDENCIES

const jsonData = require(PATHS.RAW_DATA_JSON);
const Trie = require(PATHS.TRIE_CLASS);
const fs = require('fs');

// FUNCTIONS

function processEntries(entries) {
  const accumulators = {
    entryNameSet: new Set(),
    entryTrie: new Trie(),
    entryDict: {},
  }

  let id = STARTING_ID;

  for (const entry of entries) {
    // deduplicate entries
    if (!accumulators.entryNameSet.has(entry.name)) {
      accumulators.entryNameSet.add(entry.name);

      // id is used to reduce duplicated data in the trie
      entry.id = ++id;
      processEntry(entry, id, accumulators.entryTrie, accumulators.entryDict);
    }
  }

  // combine both structures into single json, for fewer requests
  const processedObj = {
    // Trie only surfaces a jsonString, not references to its actual nodes.
    trie: JSON.parse(accumulators.entryTrie.getJsonString()),
    dict: accumulators.entryDict,
  };

  return processedObj;
}

function processEntry(entry, id, entryTrie, entryDict) {
  // store the entry's id in a trie by its display name for fast lookup.
  storeEntryInTrie(entry, entryTrie);
  // store the entry's other data in a dict by its id, to help keep the trie as small as possible.
  storeEntryInDict(entry, entryDict);
}

function storeEntryInTrie(entry, trie) {
    const keyword = `${entry.name} ${entry.type}`.replace(/\s+/g, ' ');

    console.log(keyword);

    trie.store(keyword, entry.id);
}

function storeEntryInDict(entry, dict) {
  if (!dict[entry.id]) {
    dict[entry.id] = entry;
  }
}

function saveProcessedData(outputObj) {
  const jsonString = JSON.stringify(outputObj);

  console.log('Saved processed data JSON...\n');
  fs.writeFile(PATHS.PROCESSED_DATA_JSON, jsonString, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(jsonString);
      console.log(`\n${PATHS.PROCESSED_DATA_JSON} saved!`);
    }
  });
}

// MAIN

(function main() {
  // if there a key name for the top level array?
  const entryData = ENTRY_ARRAY_KEY ?
    jsonData[ENTRY_ARRAY_KEY] :
    jsonData;

  const processedDataObj = processEntries(entryData);

  saveProcessedData(processedDataObj);
}());
