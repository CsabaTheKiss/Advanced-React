const bycript = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
    async createItem (parent, args, context, info) {
        // TODO: check if they are logged in

        const item = await context.db.mutation.createItem({
            data: {
                ...args
            }
        }, info);

        return item;
    },
    updateItem(parent, args, context, info) {
        // first take a copy of the updates
        const updates = { ...args };
        // remove the ID from the updates
        delete updates.id;
        // run the update method
        return context.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            }
        }, info
        );
    },
    async deleteItem(parent, args, context, info) { // info: query response from FE action
        const where = { id: args.id };
        // 1. find the item
        const item = await context.db.query.item({where}, `{ id title }`)
        // 2. check if they own that item / have permissions
        // TODO
        // 3. delete it!
        return context.db.mutation.deleteItem({ where }, info);
    },
    async signup(parent, args, context, info) {
        args.email = args.email.toLowerCase();
        // hash thier password
        const password = await bycript.hash(args.password, 10);
        // creat the user in the database
        const user = await context.db.mutation.createUser({
            data: {
                ...args,
                password,
                permissions: { set: ['USER'] }
            }
        }, info);
        // create the JWT token for them
        const token = jwt.sign({
            userId: user.id
        }, process.env.APP_SECRET);
        // We set the JWT as a cookie on the response
        context.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // a year cookie
        });
        // Finally we return the user to the browser
        return user;
    },
    async signin(parent, { email, password }, context, info) {
        // 1. check if there is a user with that email
        const user = await context.db.query.user({ where: { email }});
        if (!user) {
            throw new Error(`No such user found for email ${email}`);
        }
        // 2. Check if password is correct
        const valid = await bycript.compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid password!');
        }
        // 3. Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // 4. Set the cookie with the token
        context.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // a year cookie
        })
        // 5. Return the user
        return user;
    }
};

module.exports = Mutations;
