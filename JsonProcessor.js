
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
  constructor(paths, entryArrayKey, startingId) {
    this.PATHS = paths;
    this.currentId = startingId;

    const Trie = require(this.PATHS.TRIE_CLASS);
    const jsonData = require(this.PATHS.RAW_DATA_JSON);
    // if there a key name for the top level array?
    this.entryData = entryArrayKey ?
      jsonData[entryArrayKey] :
      jsonData;

    this.accumulators = Object.freeze({
      entryKeySet: new Set(),
      entriesTrie: new Trie(),
      entriesDict: {},
    });
  }

  processDataEntries(getKeyword) {
    for (const entry of this.entryData) {
      entry.key = getKeyword(entry);

      // deduplicate entries
      if (!this.accumulators.entryKeySet.has(entry.key)) {
        this.accumulators.entryKeySet.add(entry.name);

        // id is used to reduce redundant data in the trie
        entry.id = ++this.currentId;
        this.processEntry(
          entry,
          this.accumulators.entriesTrie,
          this.accumulators.entriesDict);
      }
    }

    // combine both structures into single json, for fewer requests
    const processedObj = {
      trie: this.accumulators.entriesTrie.getNodesCopy(),
      dict: this.accumulators.entriesDict,
    };

    return processedObj;
  }

  processEntry(entry, entriesTrie, entriesDict) {
    // store the entry's id in a trie by its display name for fast lookup.
    this.storeEntryInTrie(entry, entriesTrie);
    // store the entry's other data in a dict by its id, to help keep the trie as small as possible.
    this.storeEntryInDict(entry, entriesDict);
  }

  storeEntryInTrie(entry, trie) {
      trie.store(entry.key, entry.id);
  }

  storeEntryInDict(entry, dict) {
    if (!dict[entry.id]) {
      dict[entry.id] = entry;
    }
  }

  saveProcessedData() {
    const fs = require('fs');
    const outputObj = {
      trie: this.accumulators.entriesTrie.getNodesCopy(),
      dict: this.accumulators.entriesDict,
    };
    const jsonString = JSON.stringify(outputObj);

    console.log('Saving processed data JSON...\n');
    fs.writeFile(this.PATHS.PROCESSED_DATA_JSON, jsonString, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(jsonString);
        console.log(`\n${this.PATHS.PROCESSED_DATA_JSON} saved!`);
      }
    });
  }
}

module.exports = JsonProcessor;
