
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
      entryNameSet: new Set(),
      entriesTrie: new Trie(),
      entriesDict: {},
    });
  }

  processDataEntries() {
    for (const entry of this.entryData) {
      // deduplicate entries
      if (!this.accumulators.entryNameSet.has(entry.name)) {
        this.accumulators.entryNameSet.add(entry.name);

        // id is used to reduce duplicated data in the trie
        entry.id = ++this.currentId;
        this.processEntry(entry, this.currentId, this.accumulators.entriesTrie, this.accumulators.entriesDict);
      }
    }

    // combine both structures into single json, for fewer requests
    const processedObj = {
      // Trie only surfaces a jsonString, not references to its actual nodes.
      trie: JSON.parse(this.accumulators.entriesTrie.getJsonString()),
      dict: this.accumulators.entriesDict,
    };

    return processedObj;
  }

  processEntry(entry, id, entriesTrie, entriesDict) {
    // store the entry's id in a trie by its display name for fast lookup.
    this.storeEntryInTrie(entry, entriesTrie);
    // store the entry's other data in a dict by its id, to help keep the trie as small as possible.
    this.storeEntryInDict(entry, entriesDict);
  }

  storeEntryInTrie(entry, trie) {
      const keyword = `${entry.name} ${entry.type}`.replace(/\s+/g, ' ');

      console.log(keyword);

      trie.store(keyword, entry.id);
  }

  storeEntryInDict(entry, dict) {
    if (!dict[entry.id]) {
      dict[entry.id] = entry;
    }
  }

  saveProcessedData() {
    const outputObj = {
      trie: this.accumulators.entriesTrie,
      dict: this.accumulators.entriesDict,
    };

    const jsonString = JSON.stringify(outputObj);
    const fs = require('fs');

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
