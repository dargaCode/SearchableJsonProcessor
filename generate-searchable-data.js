
// CONSTANTS

const PATHS = {
  TRIE_CLASS: './Trie.js',
  RAW_DATA_JSON: './data/data-raw.json',
  PROCESSED_DATA_JSON: './data/data-searchable.json',
}

// does the array have a key name?
// set to null if not.
const ENTRY_ARRAY_KEY = 'entries';

const STARTING_ID = 10000;

// DEPENDENCIES

const jsonData = require(PATHS.RAW_DATA_JSON);
const Trie = require(PATHS.TRIE_CLASS);
const fs = require('fs');

// FUNCTIONS

function processEntries(entries) {
  const entryNameSet = new Set()
  const entryTrie = new Trie();
  const entryDict = {};
  let id = STARTING_ID;

  for (const entry of entries) {
    // deduplicate entries
    if (!entryNameSet.has(entry.name)) {
      entryNameSet.add(entry.name);

      // id is used to reduce duplicated data in the trie
      entry.id = ++id;
      // store the entry's id in a trie by its display name for fast lookup.
      storeEntryInTrie(entry, entryTrie);
      // store the entry's other data in a dict by its id, to help keep the trie as small as possible.
      storeEntryInDict(entry, entryDict);
    }
  }

  // combine both structures into single json, for fewer requests
  const processedObj = {
    // Trie only surfaces a jsonString, not references to its actual nodes.
    trie: JSON.parse(entryTrie.getJsonString()),
    dict: entryDict,
  };

  return processedObj;
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
