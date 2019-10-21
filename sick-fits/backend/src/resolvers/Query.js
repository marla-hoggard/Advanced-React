const { forwardTo } = require('prisma-binding');

const Query = {
  // Use the matching method from prisma
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),

  me(parent, args, ctx, info) {
    // Check if there is a userId
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      }, 
      info,
    );
  },
};

module.exports = Query;
