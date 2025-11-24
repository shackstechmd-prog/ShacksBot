const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ pairs: {}, linked: {}, settings: {} }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function setPair(phone, data) {
  const db = readDb();
  db.pairs[phone] = data;
  writeDb(db);
}

function getPair(phone) {
  const db = readDb();
  return db.pairs[phone];
}

function deletePair(phone) {
  const db = readDb();
  delete db.pairs[phone];
  writeDb(db);
}

function setLinked(phone, data) {
  const db = readDb();
  db.linked[phone] = data;
  writeDb(db);
}

function getLinked(phone) {
  const db = readDb();
  return db.linked[phone];
}

function listLinked() {
  const db = readDb();
  return Object.keys(db.linked);
}

function setSetting(key, val) {
  const db = readDb();
  db.settings[key] = val;
  writeDb(db);
}

function getSetting(key) {
  const db = readDb();
  return db.settings[key];
}

module.exports = {
  setPair, getPair, deletePair,
  setLinked, getLinked, listLinked,
  setSetting, getSetting
};