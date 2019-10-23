const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { transport, makeANiceEmail } = require('../mail');
const { errorIfNotLoggedIn } = require('./helpers');
const { hasPermission } = require('../utils');

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 year in milliseconds

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // Check if they are logged in
    errorIfNotLoggedIn(ctx, 'You must be logged in to create an item.');

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args,
        // Create a relationship between item and user
        user: {
          connect: {
            id: ctx.request.userId,
          }
        }
      }
    }, info);

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // First take a copy of the updates
    const updates = { ...args };
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
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);

    // 2. Check if they own that item or have permissions
    const isOwner = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(perm => ['ADMIN', 'ITEMDELETE'].includes(perm));
    if (!(isOwner || hasPermission)) {
      throw new Error("You don't have permission to delete that item.")
    }

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
          permissions: { set: ['USER'] },
        }
      },
      info,
    );

    // Create JWT token for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: ONE_YEAR, // 1 year cookie (in ms)
    });

    // Return user to the browser
    return user;
  },

  async signin(parent, args, ctx, info) {
    const { email, password } = args;

    // 1. Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }

    // 2. Check if their password is correct
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error(`Invalid Password!`);
    }

    // 3. Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: ONE_YEAR,
    });

    // 5. Return the user
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'You have been successfully signed out!' };
  },

  async requestReset(parent, args, ctx, info) {
    const { email } = args;

    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }

    // 2. Set a reset token and expiry on that user
    const asyncRandomBytes = promisify(randomBytes);
    const resetToken = (await asyncRandomBytes(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 36000000;

    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // 3. Email them that reset token
    const mailRes = await transport.sendMail({
      from: 'MarlaBHoggard@gmail.com',
      to: email,
      subject: 'Sick Fits - Reset Your Password',
      html: makeANiceEmail(`
        Reset your password here:<br/>
        \n
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a><br/><br/>
        \n
        Link trouble? Copy and paste the URL into your browser:<br/>
        \n
        ${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}
      `),
    });

    // 4. Return a success message
    return { message: "Password reset. Check your email." };
  },

  async resetPassword(parent, args, ctx, info) {
    const { resetToken, newPassword, confirmPassword } = args;

    // 1. Check if the passwords match
    if (newPassword !== confirmPassword) {
      throw new Error('Password and confirmation do not match.');
    }

    // 2. Check if it's a legit reset token and it's not expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now(),
      },
    });
    if (!user) {
      throw new Error('Password reset token is invalid or expired. Please request password reset again.');
    }

    // 4. Hash their new password
    const password = await bcrypt.hash(newPassword, 10);

    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // 6. Generate JWT
    const jwtToken = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    // 7. Set the JWT cookie
    ctx.response.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: ONE_YEAR,
    });

    // 8. Return the new user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if the user is logged in
    errorIfNotLoggedIn(ctx);

    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info,
    );

    // 3. Check if they have permission to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    // 4. Update the user permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info,
    )
  },

  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    errorIfNotLoggedIn(ctx, 'You must be signed in to access the cart.');
    const { userId } = ctx.request;

    // 2. Query the user's current cart for the selected item
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      }, info,
    });

    // 3. Check if that item is already in their cart (increment if needed)
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    }
    // 4. If it's not already in the cart, create a CartItem for the user
    return ctx.db.mutation.createCartItem({
      data: {
        user: { connect: { id: userId } },
        item: { connect: { id: args.id } },
      },
    });
  },
};

module.exports = Mutations;
