const mongoose = require('mongoose');
const { Express, server } = require('./source/app');

const Schema = mongoose.Schema;
const Model = mongoose.model;

module.exports = { Express, server, Schema, Model };
