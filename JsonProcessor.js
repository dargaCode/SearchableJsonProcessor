
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
      entry.key = getKeyword(entry).toLowerCase();

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
    // store the entry's other data in a dict by its id, to help keep the trie as small as possible.
    this.storeEntryInDict(entry, entriesDict);

    // store the entry's id in a trie by its display name for fast lookup.
    this.storeEntryInTrie(entry, entriesTrie);
  }

  storeEntryInTrie(entry, trie) {
    const keywords = this.getSuccessiveKeywordCompletions(entry.key);

    for (const keyword of keywords) {
      trie.store(keyword, entry.id);
    }
  }

  storeEntryInDict(entry, dict) {
    if (!dict[entry.id]) {
      dict[entry.id] = entry;
    }
  }

  getSuccessiveKeywordCompletions(key) {
    const completions = [];
    const words = key.split(' ');
    let completion = '';

    while (words.length > 0) {
      completion = `${words.pop()} ${completion}`;
      completions.push(completion);
    }

    return completions;
  }
}

module.exports = JsonProcessor;
