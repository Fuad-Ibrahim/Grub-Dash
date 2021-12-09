const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.status(200).json({ data: { orders } });
}

//Validations for creating orders

function checkDeliverProperty(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo === undefined || deliverTo.length === 0) {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }
  next();
}

function checkMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber === undefined || mobileNumber.length === 0) {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }
  next();
}

function checkDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes === undefined) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  } else if (Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  next();
}

function checkDishQuantity(req, res, next) {
  const {
    data: { dishes: { quantity } = {} },
  } = req.body;
  const index = dishes[quantity];
  if (quantity === undefined || quantity <= 0 || !Number.isInteger(quantity)) {
    return next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }
  next();
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: { newOrder } });
}

//Check if the order exists
function orderExists(req, res, next) {
  const orderId = req.params;
  const foundOrder = orders.find((order) => order.id == orderId);
  if (foundOrder === undefined) {
    return next({
      status: 404,
      message: `Not Found with order with ${orderId}`,
    });
  }
  res.local.orders = foundOrder;
}

function read(req, res, next) {
  const foundOrder = res.local.orders;
  res.status(200).json({ data: { foundOrder } });
}

function checkId(req, res, next) {
  const id = req.params;
  const { data: { orderId } = {} } = req.body;
  if (id == orderId) {
    return next({
      status: 404,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  next();
}

function checkStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === undefined || status.length === 0) {
    return next({
      status: 404,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  } else if (status === "delivered") {
    return next({
      status: 404,
      message: "A delivered order cannot be changed",
    });
  }
  next();
}

function update(req, res, next) {
  const foundOrder = res.local.orders;
  const { data } = req.body;
  const orderIndex = orders.indexOf(foundOrder);
  orders[orderIndex] = data;
  res.status(201).json({ data: { data } });
}

function orderIsOnPending(req, res, next) {
  const foundOrder = res.local.orders;
  if (foundOrder.status !== "pending") {
    return next({
      status: 404,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const indexToDeleteFrom = orders.findIndex(
    (order) => order.id === Number(orderId)
  );
  orders.splice(indexToDeleteFrom, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    checkDeliverProperty,
    checkMobileNumber,
    checkDishes,
    checkDishQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    checkDeliverProperty,
    checkMobileNumber,
    checkDishes,
    checkDishQuantity,
    checkId,
    checkStatus,
    update,
  ],
  destroy: [checkId, orderIsOnPending, destroy],
};
