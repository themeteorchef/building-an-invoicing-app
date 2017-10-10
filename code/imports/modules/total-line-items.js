export default items => items.reduce((sum, item) => (sum + item.amount), 0);
