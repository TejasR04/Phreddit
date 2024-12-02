//User mongoose schema that includes first name, last name, email, password(hash), created date, reputation(100), display name, list of post ids, list of comment ids, and list of community ids.
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 50,
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        maxLength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    reputation: {
        type: Number,
        required: true,
        default: 100,
    },
    displayName: {
        type: String,
        required: true,
        maxLength: 50,
    },
    postIDs: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        },
    ],
    commentIDs: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        },
    ],
    communityIDs: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        },
    ],
    });

    userSchema.virtual("url").get(function () {
        return `users/${this._id}`;
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
}
);

module.exports = mongoose.model("User", userSchema);




