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
    }
};

module.exports = Mutations;
