const pool = require("../config/db");

const mapOrderHistoryRows = (rows) =>
  rows.map((row) => ({
    id: row.id,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    items: row.items || [],
  }));

exports.createOrderFromCart = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cartResult = await client.query(
      `
      SELECT p.id, p.name, p.price, c.quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId],
    );

    const cartItems = cartResult.rows || [];
    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0,
    );

    const orderInsert = await client.query(
      `
      INSERT INTO orders (user_id, total, status)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, total, status, created_at
      `,
      [userId, total.toFixed(2), "completed"],
    );

    const order = orderInsert.rows[0];

    for (const item of cartItems) {
      const unitPrice = Number(item.price || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = unitPrice * quantity;

      await client.query(
        `
        INSERT INTO order_items
          (order_id, product_id, product_name, unit_price, quantity, line_total)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          item.id,
          item.name,
          unitPrice.toFixed(2),
          quantity,
          lineTotal.toFixed(2),
        ],
      );
    }

    await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);
    await client.query("COMMIT");

    return {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
      itemCount: cartItems.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.getOrderHistory = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      o.id,
      o.total,
      o.status,
      o.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'unitPrice', oi.unit_price,
            'quantity', oi.quantity,
            'lineTotal', oi.line_total
          )
          ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    `,
    [userId],
  );

  return mapOrderHistoryRows(result.rows || []);
};
