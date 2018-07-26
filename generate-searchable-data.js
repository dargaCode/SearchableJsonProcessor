
// CONSTANTS

const PATHS = {
  TRIE_CLASS: './Trie.js',
  RAW_DATA_JSON: './data/data-raw.json',
  PROCESSED_DATA_JSON: './data/data-searchable.json',
}

const STARTING_ID = 10000;

// DEPENDENCIES

const productData = require(PATHS.RAW_DATA_JSON).products;
const Trie = require(PATHS.TRIE_CLASS);
const fs = require('fs');

// FUNCTIONS

function processData(productEntries) {
  const productNameSet = new Set()
  const productTrie = new Trie();
  const productDict = {};
  let id = STARTING_ID;

  for (const entry of productEntries) {
    // deduplicate products
    if (!productNameSet.has(entry.name)) {
      productNameSet.add(entry.name);

      // id is used to reduce duplicated data in the trie
      entry.id = ++id;
      // store the entry's id in a trie by its display name for fast lookup.
      storeEntryInTrie(entry, productTrie);
      // store the entry's other data in a dict by its id, to help keep the trie as small as possible.
      storeEntryInDict(entry, productDict);
    }
  }

  // combine both structures into single json, for fewer requests
  const processedObj = {
    // Trie only surfaces a jsonString, not references to its actual nodes.
    trie: JSON.parse(productTrie.getJsonString()),
    dict: productDict,
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

  fs.writeFile(PATHS.PROCESSED_DATA_JSON, jsonString, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Saved processed data JSON:\n');
      console.log(jsonString);
    }
  });
}

// MAIN

(function main() {
  const processedDataObj = processData(productData);

  saveProcessedData(processedDataObj);
}());
