const db = require("../config/database");

const getCalendarOrders = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        o.id,
        o.first_name,
        o.last_name,
        o.status,
        c.article_name,
        c.start_date,
        c.end_date,
        c.delivery_date
      FROM orders o
      JOIN custom_order_details c ON o.id = c.order_id
      WHERE o.type = 'CUSTOM'
    `;
    const [orders] = await db.execute(query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCalendarOrders,
};
