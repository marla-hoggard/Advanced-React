// Returns true if the user is logged in, false if not
// @ctx - The context from a Query or Mutation
const isLoggedIn = ctx => {
  return ctx.request.userId;
}

// Throws an error if the user is not logged in
// @ctx - The context from a Query or Mutation
// @errorMessage - Optional custom error message text
const errorIfNotLoggedIn = (ctx, errorMessage='You must be logged in to access this feature.') => {
  if (!isLoggedIn(ctx)) {
    throw new Error(errorMessage);
  }
}

exports.isLoggedIn = isLoggedIn;
exports.errorIfNotLoggedIn = errorIfNotLoggedIn;