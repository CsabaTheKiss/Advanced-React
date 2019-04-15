const bycript = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    randomBytes
} = require('crypto');
const {
    promisify
} = require('util');

const {
    transport,
    makeANiceEmail
} = require('../mail');

const {
    hasPermission
} = require('../utils');

const Mutations = {
    async createItem (parent, args, context, info) {
        if (!context.request.userId) {
            throw new Error('You must be logged in to do that!');
        }

        const item = await context.db.mutation.createItem({
            data: {
                // This is how to create relationship between the item and the Usder
                user: {
                    connect: {
                        id: context.request.userId
                    }
                },
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
        const item = await context.db.query.item({where}, `{ id title user { id } }`)
        // 2. check if they own that item / have permissions
        const ownsItem = item.user.id === context.request.userId;
        const hasPermissions = context.request.user.permissions.some(permission => [ 'ADMIN', 'ITEMDELETE' ].includes(permission));
        
        if ( !ownsItem && !hasPermissions) {
            throw new Error('You do not have the permissions for this operation.');
        }
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
    },
    signout (parent, args, context, info) {
        context.response.clearCookie('token');
        return {
            message: 'Goodbye!'
        }
    },
    async requestReset (parent, args, context, info) {
        // 1. check if this is a real user
        const user = await context.db.query.user({ where: { email: args.email } });
        if (!user) {
            throw new Error(`No such user found for email ${args.email}`);
        }
        // 2. Set a reset token and expiry on that user
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken = (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        const response = await context.db.mutation.updateUser({
            where: { email: args.email },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        console.log(response);
        // 3. Email them that reset token
        const mailResponse = await transport.sendMail({
            from: 'coc@coc.com',
            to: user.email,
            subject: 'Your Password Reset',
            html: makeANiceEmail(`Your Password Reset Token is here!
                \n\n
                <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
                    Click here to reset!
                </a>`
            )
        });
        // 4. return the message
        return {
            message: 'Thanks!'
        }
    },
    async resetPassword (parent, args, context, info) {
        // 1. check if passwords match
        if ( args.password !== args.confirmPassword ) {
            throw new Error('Yo passwords don\'t match!')
        }
        // 2. check if it a legit reset token
        // 3. check if its expired
        const [user] = await context.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000
            }
        });
        if (!user) {
            throw new Error('This token is either invalid or expired!');
        }
        // 4. Hash thier new password
        const password = await bycript.hash(args.password, 10);
        // 5. save the new password to the user and remove old reset token fields
        const updatedUser = await context.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null
            }
        })
        // 6. Generate JWT
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        // 7. Set the JWT cookie
        context.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // a year cookie
        })
        // 8. return the new user
        return updatedUser;
        // 9. HHEWEHEWW have a beer :)
    },
    async updatePermissions (parent, args, context, info) {
        // 1. Check if they are logged in
        if (!context.request.userId) {
            throw new Error('You must be logged in to do that!');
        }
        // 2. Query the current user
        const currentUser = await context.db.query.user({
            where: {
                id: context.request.userId
            }
        }, info);
        // 3. Check if they have permissions to do this
        hasPermission(currentUser, ['ADMIN', 'PERMISSION_UPDATE']);
        // 4. UpdAte the permissions
        return context.db.mutation.updateUser({
            data: {
                permissions: {
                    set: args.permissions
                },
            },
            where: {
                id: args.userId
            }
        }, info);
    },
    async addToCart(parent, args, context, info) {
        // 1. Make sure they are signed in
        const userId = context.request.userId;
        if (!userId) {
            throw new Error('You must be logged in to do that!');
        }
        // 2. Qury the users current cart
        const [ existingCartItem ] = await context.db.query.cartItems({
            where: {
                user: { id: userId },
                item: { id: args.id }
            }
        });
        // 3. Check if that item is already in thier cart and inc by 1 if it is
        if (existingCartItem) {
            return context.db.mutation.updateCartItem({
                where: { id: existingCartItem.id },
                data: {
                    quantity: existingCartItem.quantity + 1
                }
            }, info);
        }
        // 4. if it's not create a fresh cart item for that user
        return context.db.mutation.createCartItem({
            data: {
                user: {
                    connect: { id: userId }
                },
                item: {
                    connect: { id: args.id }
                }
            }
        }, info);
    },
    async removeFromCart(parent, args, context, info) {
        // 1. Find the cart item
        const cartItem = await context.db.query.cartItem({
            where: {
                id: args.id
            }
        }, `{ id, user { id } }`); // we need user, who owns it, so we make a manual query here instead of info
        // 1.5 Make sure we found an item
        if (!cartItem) throw new Error('No CartItem Found!');
        // 2. Make sure they own that cart item
        if (cartItem.user.id !== context.request.userId) {
            throw new Error('Cheatin huhhhh!???');
        }
        // 3. Delete that cart item
        return context.db.mutation.deleteCartItem({
            where: { id: args.id },
        }, info)
    }
};

module.exports = Mutations;
