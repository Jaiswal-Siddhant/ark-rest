const { Model, Schema } = require('ark-rest/exports');
const bcrypt = require('bcrypt');

const user = new Schema({
    name: String,
    age: Number,
    gender: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

user.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// This method is required while using Auth. There must be comparePassword method in model.
user.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Model('User', user);
