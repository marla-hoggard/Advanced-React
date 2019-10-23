/* Checks if the user has at least one of the necessary permissions
 * @user - a user object
 * @permissionsNeeded - an array of permissions, 
 * any of which allow access to the desired feature
*/
function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions: ${permissionsNeeded}.
      You Have: ${user.permissions}`
    );
  }
}

exports.hasPermission = hasPermission;
