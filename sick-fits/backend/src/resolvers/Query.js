const { forwardTo } = require('prisma-binding');

const { errorIfNotLoggedIn, isLoggedIn } = require('./helpers');
const { hasPermission } = require('../utils');

const Query = {
  // Use the matching method from prisma
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),

  me(parent, args, ctx, info) {
    // Check if there is a userId
    if (!isLoggedIn(ctx)) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info,
    );
  },

  users(parent, args, ctx, info) {
    // 1. Check they are logged in
    errorIfNotLoggedIn(ctx);

    // 2. Check if the user as the permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONSUPDATE']);

    // 3. Query all the users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    errorIfNotLoggedIn(ctx);

    // 2. Query the current order
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);

    // 3. Make sure they have permissions to see the order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionOrder = ctx.request.user.permissions.includes('ADMIN');

    if (!ownsOrder || !hasPermissionOrder) {
      throw new Error("You don't have permission to see this order.");
    }

    // 4. Return the order
    return order;
  }
};

module.exports = Query;
