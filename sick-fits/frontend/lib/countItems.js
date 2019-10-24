export default function countItems(cart) {
  return cart.reduce((tally, item) => tally + item.quantity, 0);
}