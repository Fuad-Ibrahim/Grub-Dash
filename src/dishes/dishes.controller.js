const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//List all dishes
function list(req, res) {
  res.status(201).json({ data: { dishes } });
}

//Validations

function nameExist(req, res, next) {
  const { name } = req.body.name;
  if (name === undefined || name.length === 0) {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  next();
}

function descriptionCheck(req, res, next) {
  const { description } = req.body.description;
  if (description === undefined || description.length === 0) {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  next();
}

function priceExist(req, res, next) {
  const { price } = req.body.price;
  if (price === undefined) {
    return next({
      status: 400,
      message: "Dish must include a price",
    });
  } else if (price === 0 || price < 0 || Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  next();
}

function imageExist(req, res, next) {
  const { image_url } = req.body.image_url;
  if (image_url === undefined || image_url.length === 0) {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  next();
}

// Create a new dish
//Create a new Id for new dishes
let newId = dishes.length + 1;
function create(req, res, next) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    newId,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: { newDish } });
}


// validation for dish id
function dishExist(req,res,next){
    const {dishId} = req.params;
    const { data:{id} = {}} = req.body;
    const foundDish = dishes.find(dish=> dish.id === dishId)
    if(dishId === undefined){
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}`
        })
    }
    else if (id !== dishId){
        next({
            status: 404,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }
    
}
// read one dish using dish id
function(req, res, next){
    const 
    res.stats(200).json({data:{foundDish}})
} 

module.exports = {
  list,
  create: [nameExist, descriptionCheck, priceExist, imageExist, create],
};
