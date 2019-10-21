const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem({
      data: { ...args }
    }, info);

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // First take a copy of the updates
    const updates = {...args};
    // Remove the ID from the updates
    delete updates.id;
    // Run the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: { id: args.id },
    }, info);
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };

    // 1. Find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // 2. Check if they own that item or have permissions
    // TODO
    // 3. Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();

    // Hash their password
    // Pass in PW and SALT length for uniqueness between sites
    const password = await bcrypt.hash(args.password, 10);

    // Create the user in the db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER']},
        }
      }, 
      info,
    );

    // Create JWT token for user
    const token = jwt.sign({ userId: user.id}, process.env.APP_SECRET);

    // Set JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie (in ms)
    });

    // Return user to the browser
    return user;
  },

  async signin(parent, args, ctx, info) {
    const { email, password } = args;

    // 1. Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email }});
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }

    // 2. Check if their password is correct
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error(`Invalid Password!`);
    }

    // 3. Generate JWT token
    const token = jwt.sign({ userId: user.id}, process.env.APP_SECRET);

    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie (in ms)
    });

    // 5. Return the user
    return user;
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'You have been successfully signed out!' };
  },
};

module.exports = Mutations;
