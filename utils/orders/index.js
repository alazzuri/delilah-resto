const {
  sequelize,
  insertQuery,
  selectQuery,
  updateQuery,
  deleteQuery,
  joinQuery
} = require("../../db");
const { findUserbyUsername } = require("../users");
const { findProductById } = require("../products");

async function createOrder(req, res, next) {
  const { user, products, payment_method } = req.body;
  if (user && products && payment_method) {
    try {
      const addedOrder = await addOrderInDb(user, products, payment_method);
      req.createdOrder = addedOrder;
      next();
    } catch (err) {
      next(new Error(err));
    }
  } else {
    res.status(405).json("Missing Arguments");
  }
}

async function addOrderInDb(user, products, payment_method) {
  const userData = await findUserbyUsername(user);
  const userId = userData.idusers;
  const orderTime = new Date().toLocaleTimeString(); /// ver como se pasa a formato base de datos
  const [orderDesc, totalPrice] = await obtainOrderDescAndPrice(products);
  const addedOrder = await createOrderRegistry(
    orderTime,
    orderDesc,
    totalPrice,
    payment_method,
    userId
  );
  addedRelationship = await createOrderRelationship(addedOrder, products);
  if (addedRelationship) {
    const orderInfo = await printOrderInfo(addedOrder);
    return orderInfo;
  } else {
    console.error(err);
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

async function findProductPrice(product) {
  const { productId, quantity } = product;
  const productPrice = (await findProductById(productId)).product_price;
  const subtotal = `${+productPrice * +quantity}`;
  return subtotal;
} /// llevar a productos

async function createOrderRegistry(
  orderTime,
  orderDescription,
  totalPrice,
  paymentMethod,
  user
) {
  const query = insertQuery(
    "orders",
    "order_time, order_description, order_amount, payment_method, id_user",
    [orderTime, orderDescription, totalPrice, paymentMethod, user]
  );

  const [addedRegistry] = await sequelize.query(query, { raw: true });
  return addedRegistry;
}

async function createOrderRelationship(orderId, products) {
  products.forEach(async product => {
    const { productId, quantity } = product;
    const query = insertQuery(
      "orders_products",
      "order_id, product_id, quantity",
      [orderId, productId, quantity]
    );
    await sequelize.query(query, { raw: true });
  });
  return true;
}

async function printOrderInfo(orderId) {
  const ordersQuery = joinQuery(
    "orders",
    "orders.*, users.username, users.firstname, users.lastname,users.address, users.email, users.phone_number",
    ["users ON orders.id_user = users.idusers"],
    `idorders = ${orderId}`
  );

  const [orderInfo] = await sequelize.query(ordersQuery, { raw: true });

  const completeDesc = async () => {
    const order = orderInfo[0];
    const productsQuery = joinQuery(
      "orders_products",
      "orders_products.quantity, products.*",
      [`products ON orders_products.product_id = products.idproducts`],
      `order_id = ${order.idorders}`
    );
    const [productsInfo] = await sequelize.query(productsQuery, {
      raw: true
    });
    order.products = await productsInfo;
    return order;
  };

  return completeDesc();
}

async function listOrders(req, res, next) {
  try {
    const ordersQuery = selectQuery("orders", "idorders");
    const [ordersIds] = await sequelize.query(ordersQuery, { raw: true });
    const detailedOrders = async () => {
      return Promise.all(
        ordersIds.map(async order => printOrderInfo(order.idorders))
      );
    };
    req.ordersList = await detailedOrders();
    next();
  } catch (err) {
    next(new Error(err));
  }
}

async function updateOrderStatus(req, res, next) {
  const id = +req.params.orderId;
  const { status } = req.body; // unificar nombres de constantes
  const validStatus = validateStatus(status);
  if (validStatus) {
    try {
      const orderToUpdate = await findOrderbyId(id);
      if (orderToUpdate) {
        const query = updateQuery(
          "orders",
          `status = '${status}'`,
          `idorders = ${id}`
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
    res.status(405).json("Invalid status suplied"); // ver el status code y cambiar en la DOC de la API
  }
}

function validateStatus(submittedStatus) {
  const validStatus = [
    "new",
    "confirmed",
    "preparing",
    "delivering",
    "delivered"
  ];
  const existingStatus = validStatus.find(status => status === submittedStatus);
  return existingStatus;
}

async function findOrderbyId(orderId) {
  const existingOrder = async () => {
    const query = selectQuery("orders", "*", `idorders = ${orderId}`);
    const [dbOrder] = await sequelize.query(query, { raw: true });
    const foundOrder = await dbOrder.find(
      element => element.idorders === orderId
    );
    return foundOrder;
  };

  return existingOrder();
}

async function deleteOrder(req, res, next) {
  const id = +req.params.orderId;
  try {
    const orderToDelete = await findOrderbyId(id);
    if (orderToDelete) {
      const query = deleteQuery("orders", `idorders = ${id}`);
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

module.exports = { createOrder, listOrders, updateOrderStatus, deleteOrder };
