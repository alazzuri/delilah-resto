// DATABASE
const {
  deleteQuery,
  insertQuery,
  joinQuery,
  selectQuery,
  sequelize,
  updateQuery,
} = require("../../db");

// UTILS
const { findUserByUsername } = require("../users");

const { findProductById, findProductPrice } = require("../products");

async function addOrderInDb(req, res) {
  const { username, products, payment_method } = req.body;
  if (username && products && payment_method) {
    const userData = await findUserByUsername(username);
    if (userData) {
      const userId = userData.user_id;
      const orderTime = new Date().toLocaleTimeString();
      const [orderDesc, totalPrice] = await obtainOrderDescAndPrice(products);
      const addedOrder = await createOrderRegistry(
        orderTime,
        orderDesc,
        totalPrice,
        payment_method,
        userId
      );
      await createOrderRelationship(addedOrder, products);
      return await printOrderInfo(addedOrder);
    } else {
      res.status(400).json("User not found");
    }
  } else {
    res.status(405).json("Missing Arguments");
  }
}

async function completeDesc(orderInfo) {
  const order = orderInfo[0];
  const productsQuery = joinQuery(
    "orders_products",
    "orders_products.product_quantity, products.*",
    [`products ON orders_products.product_id = products.product_id`],
    `order_id = ${order.order_id}`
  );
  const [productsInfo] = await sequelize.query(productsQuery, {
    raw: true,
  });
  order.products = await productsInfo;
  return order;
}

async function createOrder(req, res, next) {
  try {
    req.createdOrder = await addOrderInDb(req, res);
    next();
  } catch (err) {
    next(new Error(err));
  }
}

async function createOrderRegistry(
  orderTime,
  orderDescription,
  totalPrice,
  paymentMethod,
  user
) {
  const query = insertQuery(
    "orders",
    "order_time, order_description, order_amount, payment_method, user_id",
    [orderTime, orderDescription, totalPrice, paymentMethod, user]
  );
  const [addedRegistry] = await sequelize.query(query, { raw: true });
  return addedRegistry;
}

async function createOrderRelationship(orderId, products) {
  products.forEach(async (product) => {
    const { productId, quantity } = product;
    const query = insertQuery(
      "orders_products",
      "order_id, product_id, product_quantity",
      [orderId, productId, quantity]
    );
    await sequelize.query(query, { raw: true });
  });
  return true;
}

async function deleteOrder(req, res, next) {
  const id = +req.params.orderId;
  try {
    const orderToDelete = await findOrderbyId(id);
    if (orderToDelete) {
      const query = deleteQuery("orders", `order_id = ${id}`);
      await sequelize.query(query, { raw: true });
      req.isDeleted = true;
      next();
    } else {
      res.status(404).json("Order not found");
    }
  } catch (err) {
    next(new Error(err));
  }
}

async function findOrderbyId(orderId) {
  const query = selectQuery("orders", "*", `order_id = ${orderId}`);
  const [dbOrder] = await sequelize.query(query, { raw: true });
  const foundOrder = await dbOrder.find(
    (element) => element.order_id === orderId
  );
  return foundOrder;
}

async function listOrders(req, res, next) {
  try {
    const ordersQuery = selectQuery("orders", "order_id");
    const [ordersIds] = await sequelize.query(ordersQuery, { raw: true });
    const detailedOrders = async () => {
      return Promise.all(
        ordersIds.map(async (order) => printOrderInfo(order.order_id))
      );
    };
    req.ordersList = await detailedOrders();
    next();
  } catch (err) {
    next(new Error(err));
  }
}

async function obtainOrderDescAndPrice(products) {
  let orderDescription = "";
  let subtotal = 0;
  for (let i = 0; i < products.length; i++) {
    orderDescription = orderDescription + (await printDescName(products[i]));
    subtotal = +subtotal + +(await findProductPrice(products[i]));
  }
  return [orderDescription, subtotal];
}

async function printDescName(product) {
  const { productId, quantity } = product;
  const productName = (await findProductById(productId)).product_name;
  const productDesc = `${quantity}x${productName.slice(0, 5)} `;
  return productDesc;
}

async function printOrderInfo(orderId) {
  const ordersQuery = joinQuery(
    "orders",
    "orders.*, users.username, users.firstname, users.lastname,users.address, users.email, users.phone_number",
    ["users ON orders.user_id = users.user_id"],
    `order_id = ${orderId}`
  );
  const [orderInfo] = await sequelize.query(ordersQuery, { raw: true });
  return completeDesc(orderInfo);
}

async function updateOrderStatus(req, res, next) {
  const id = +req.params.orderId;
  const { status } = req.body;
  const validStatus = validateStatus(status);
  if (validStatus) {
    try {
      const orderToUpdate = await findOrderbyId(id);
      if (orderToUpdate) {
        const query = updateQuery(
          "orders",
          `order_status = '${status}'`,
          `order_id = ${id}`
        );
        await sequelize.query(query, { raw: true });
        req.updatedOrder = await findOrderbyId(id);
      } else {
        res.status(404).json("Order not found");
      }
      next();
    } catch (err) {
      next(new Error(err));
    }
  } else {
    res.status(405).json("Invalid status suplied");
  }
}

function validateStatus(submittedStatus) {
  const validStatus = [
    "new",
    "confirmed",
    "preparing",
    "delivering",
    "delivered",
  ];
  const existingStatus = validStatus.find(
    (status) => status === submittedStatus
  );
  return existingStatus;
}

module.exports = {
  completeDesc,
  createOrder,
  deleteOrder,
  listOrders,
  updateOrderStatus,
};
