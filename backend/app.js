const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 3000;


app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "my-blog-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const dataFolder = path.join(__dirname, "data");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

const usersFile = path.join(dataFolder, "users.json");
const postsFile = path.join(dataFolder, "posts.json");

function readData(file) {
    if (!fs.existsSync(file)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please sign in first."
        });
    }

    next();
}

app.get("/api", (req, res) => {
    res.json({ message: "Blog API operational" });
});

app.post("/api/signup", (req, res) => {
    const { user_id, password, name } = req.body;

    if (!user_id || !password || !name) {
        return res.status(400).json({
            message: "Please complete all fields."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters."
        });
    }

    const users = readData(usersFile);

    const existingUser = users.find(
        user => user.user_id.toLowerCase() === user_id.trim().toLowerCase()
    );

    if (existingUser) {
        return res.status(409).json({
            message: "That user ID is already taken."
        });
    }

    const newUser = {
        id: randomUUID(),
        user_id: user_id.trim(),
        passwordHash: bcrypt.hashSync(password, 10),
        name: name.trim()
    };

    users.push(newUser);
    saveData(usersFile, users);

    res.status(201).json({
        message: "Account created successfully!"
    });
});

app.post("/api/signin", (req, res) => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({
            message: "Enter your user ID and password."
        });
    }

    const users = readData(usersFile);

    const user = users.find(
        user => user.user_id.toLowerCase() === user_id.trim().toLowerCase()
    );

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({
            message: "Incorrect user ID or password."
        });
    }

    req.session.regenerate((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not start your session."
            });
        }

        req.session.userId = user.id;
        req.session.name = user.name;

        res.json({
            message: "Signed in successfully!",
            user: {
                user_id: user.user_id,
                name: user.name
            }
        });
    });
});

app.post("/api/signout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not sign out."
            });
        }

        res.clearCookie("connect.sid");

        res.json({ message: "Signed out successfully." });
    });
});

app.get("/api/me", (req, res) => {
    if (!req.session.userId) {
        return res.json({ user: null });
    }

    const users = readData(usersFile);

    const user = users.find(
        user => user.id === req.session.userId
    );

    if (!user) {
        return res.json({ user: null });
    }

    res.json({
        user: {
            user_id: user.user_id,
            name: user.name
        }
    });
});


app.get("/api/posts", (req, res) => {
    const posts = readData(postsFile);

    const postsWithOwnership = posts.map(post => ({
        ...post,
        isOwner: post.userId === req.session.userId
    }));

    res.json(postsWithOwnership);
});

app.post("/api/posts", requireLogin, (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and content are required."
        });
    }

    const posts = readData(postsFile);

    const newPost = {
        id: randomUUID(),
        userId: req.session.userId,
        author: req.session.name,
        title: title.trim(),
        content: content.trim(),
        date: new Date().toLocaleDateString()
    };

    posts.push(newPost);
    saveData(postsFile, posts);

    res.status(201).json({
        message: "Post created successfully!",
        post: { ...newPost, isOwner: true }
    });
});

app.put("/api/posts/:id", requireLogin, (req, res) => {
    const posts = readData(postsFile);

    const post = posts.find(
        post => post.id === req.params.id
    );

    if (!post) {
        return res.status(404).json({
            message: "Post not found."
        });
    }

    if (post.userId !== req.session.userId) {
        return res.status(403).json({
            message: "You cannot edit another user's post."
        });
    }

    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and content are required."
        });
    }

    post.title = title.trim();
    post.content = content.trim();

    saveData(postsFile, posts);

    res.json({
        message: "Post updated successfully!",
        post: { ...post, isOwner: true }
    });
});

app.delete("/api/posts/:id", requireLogin, (req, res) => {
    const posts = readData(postsFile);

    const postIndex = posts.findIndex(
        post => post.id === req.params.id
    );

    if (postIndex === -1) {
        return res.status(404).json({
            message: "Post not found."
        });
    }

    if (posts[postIndex].userId !== req.session.userId) {
        return res.status(403).json({
            message: "You cannot delete another user's post."
        });
    }

    posts.splice(postIndex, 1);
    saveData(postsFile, posts);

    res.json({
        message: "Post deleted successfully!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
